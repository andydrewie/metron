import Foundation
import HealthKit
import SwiftUI

// Research-only, read-only, in-memory HealthKit experiment.
// Never uploads, logs, stores, or modifies personal Health data.
struct SourceStepTotal: Identifiable {
    var id: String { name }
    let name: String
    let steps: Double
}

struct PilotObservation {
    let workoutStart: Date
    let workoutEnd: Date
    let calendarDayStart: Date
    let dailyStatistic: Double?
    let sourceTotals: [SourceStepTotal]
    let associatedSampleCount: Int
    let dailyRawSampleCount: Int
    let identicalSampleCount: Int
    let identicalSampleSteps: Double
    let associatedQueryCapped: Bool
    let dailyQueryCapped: Bool
    let crossesDayBoundary: Bool
}

final class HealthPilotModel: ObservableObject {
    @Published private(set) var working = false
    @Published private(set) var message = "No Health data has been requested."
    @Published private(set) var observation: PilotObservation?

    private let store = HKHealthStore()
    private let sampleLimit = 4000
    private var readToken = UUID()

    private var stepType: HKQuantityType {
        HKObjectType.quantityType(forIdentifier: .stepCount)!
    }

    func clear() {
        // Results exist only in app memory and disappear when cleared or the app exits.
        // HealthKit access permissions are controlled separately in iOS Settings.
        readToken = UUID()
        observation = nil
        message = "Results cleared from this app's memory."
        working = false
    }

    func run() {
        guard !working else { return }
        guard HKHealthStore.isHealthDataAvailable() else {
            message = "HealthKit is unavailable on this device."
            return
        }
        let token = UUID()
        readToken = token
        working = true
        observation = nil
        message = "Requesting read-only access on your device…"

        let readTypes: Set<HKObjectType> = [HKObjectType.workoutType(), stepType]
        store.requestAuthorization(toShare: [], read: readTypes) { [weak self] _, error in
            guard let self else { return }
            if let error {
                self.finishError(error.localizedDescription, token: token)
                return
            }
            // A successful request means the sheet was processed, NOT that reading
            // workouts or steps was granted. HealthKit intentionally hides that fact.
            self.findLatestWorkout(token: token)
        }
    }

    private func finishError(_ detail: String, token: UUID) {
        DispatchQueue.main.async {
            guard self.readToken == token else { return }
            self.message = "This test could not complete: \(detail)"
            self.working = false
        }
    }

    private func findLatestWorkout(token: UUID) {
        let now = Date()
        let sevenDaysAgo = now.addingTimeInterval(-7 * 24 * 60 * 60)
        let period = HKQuery.predicateForSamples(withStart: sevenDaysAgo, end: now, options: [])
        let newestFirst = [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]
        let query = HKSampleQuery(
            sampleType: .workoutType(), predicate: period, limit: 1,
            sortDescriptors: newestFirst
        ) { [weak self] _, objects, error in
            guard let self else { return }
            if let error { self.finishError(error.localizedDescription, token: token); return }
            guard let workout = (objects as? [HKWorkout])?.first else {
                self.finishNoData(token: token)
                return
            }
            self.fetchWorkoutStepSamples(workout, token: token)
        }
        store.execute(query)
    }

    private func finishNoData(token: UUID) {
        DispatchQueue.main.async {
            guard self.readToken == token else { return }
            self.working = false
            self.message = "No recent workout is visible. There may be no workout in the last seven days, access may be limited, or read permission may not have been granted. HealthKit does not reveal which."
        }
    }

    private func fetchWorkoutStepSamples(_ workout: HKWorkout, token: UUID) {
        let associatedPredicate = HKQuery.predicateForObjects(from: workout)
        fetchSteps(matching: associatedPredicate) { [weak self] outcome in
            guard let self else { return }
            switch outcome {
            case .failure(let error):
                self.finishError(error.localizedDescription, token: token)
            case .success(let associated):
                self.fetchDaySamples(for: workout, associated: associated, token: token)
            }
        }
    }

    private func fetchSteps(
        matching predicate: NSPredicate,
        completion: @escaping (Result<[HKQuantitySample], Error>) -> Void
    ) {
        let query = HKSampleQuery(
            sampleType: stepType,
            predicate: predicate,
            limit: sampleLimit,
            sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
        ) { _, samples, error in
            if let error {
                completion(.failure(error))
            } else {
                completion(.success((samples as? [HKQuantitySample]) ?? []))
            }
        }
        store.execute(query)
    }

    private func fetchDaySamples(
        for workout: HKWorkout, associated: [HKQuantitySample], token: UUID
    ) {
        let calendar = Calendar.current
        let dayStart = calendar.startOfDay(for: workout.startDate)
        guard let nextDay = calendar.date(byAdding: .day, value: 1, to: dayStart) else {
            finishError("The local calendar day could not be constructed.", token: token)
            return
        }

        // The sample query selects samples by START date. This is deliberately
        // NOT asserted to reproduce the HealthKit merged statistics algorithm.
        let predicate = HKQuery.predicateForSamples(
            withStart: dayStart, end: nextDay, options: .strictStartDate
        )
        fetchSteps(matching: predicate) { [weak self] outcome in
            guard let self else { return }
            switch outcome {
            case .failure(let error):
                self.finishError(error.localizedDescription, token: token)
            case .success(let daily):
                self.fetchDailyStatistics(
                    for: workout,
                    dayStart: dayStart, dayEnd: nextDay,
                    daily: daily, associated: associated, token: token
                )
            }
        }
    }

    private func fetchDailyStatistics(
        for workout: HKWorkout,
        dayStart: Date, dayEnd: Date,
        daily: [HKQuantitySample],
        associated: [HKQuantitySample],
        token: UUID
    ) {
        // Unlike the raw sample query above, this uses a HealthKit statistic,
        // which can merge data from different sources by HealthKit semantics.
        let predicate = HKQuery.predicateForSamples(
            withStart: dayStart, end: dayEnd, options: []
        )
        let query = HKStatisticsQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: [.cumulativeSum, .separateBySource]
        ) { [weak self] _, stats, error in
            guard let self else { return }
            if let error { self.finishError(error.localizedDescription, token: token); return }
            let countUnit = HKUnit.count()
            let dailyIDs = Set(daily.map(\.uuid))
            let sharedSamples = associated.filter { dailyIDs.contains($0.uuid) }

            let bySource: [SourceStepTotal] = (stats?.sources ?? []).compactMap { source in
                guard let quantity = stats?.sumQuantity(for: source) else { return nil }
                return SourceStepTotal(
                    name: source.name,
                    steps: quantity.doubleValue(for: countUnit)
                )
            }.sorted { $0.name < $1.name }

            let result = PilotObservation(
                workoutStart: workout.startDate,
                workoutEnd: workout.endDate,
                calendarDayStart: dayStart,
                dailyStatistic: stats?.sumQuantity()?.doubleValue(for: countUnit),
                sourceTotals: bySource,
                associatedSampleCount: associated.count,
                dailyRawSampleCount: daily.count,
                identicalSampleCount: sharedSamples.count,
                identicalSampleSteps: sharedSamples.reduce(0) {
                    $0 + $1.quantity.doubleValue(for: countUnit)
                },
                associatedQueryCapped: associated.count >= self.sampleLimit,
                dailyQueryCapped: daily.count >= self.sampleLimit,
                crossesDayBoundary: workout.endDate > dayEnd
            )

            DispatchQueue.main.async {
                guard self.readToken == token else { return }
                self.observation = result
                self.message = "Local comparison completed. Read the interpretation before drawing conclusions."
                self.working = false
            }
        }
        store.execute(query)
    }
}
