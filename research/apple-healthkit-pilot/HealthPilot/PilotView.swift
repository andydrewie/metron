import SwiftUI

private enum PilotStyle {
    static let ink = Color(red: 37/255, green: 42/255, blue: 48/255)
    static let slate = Color(red: 88/255, green: 102/255, blue: 116/255)
    static let blue = Color(red: 0/255, green: 114/255, blue: 178/255)
    static let copper = Color(red: 180/255, green: 83/255, blue: 9/255)
}

struct PilotView: View {
    @StateObject private var pilot = HealthPilotModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("A small question, carefully measured.")
                        .font(.system(size: 26, weight: .semibold, design: .rounded))
                        .foregroundStyle(PilotStyle.ink)

                    Text("Are the exact step samples associated with your latest workout also visible in a calendar-day step query?")
                        .font(.body)
                        .foregroundStyle(PilotStyle.slate)

                    VStack(alignment: .leading, spacing: 7) {
                        label("PRIVACY")
                        Text("Only workouts and steps. Nothing is uploaded, persisted, or changed in Apple Health. Results stay in app memory.")
                            .font(.subheadline)
                        Text("This experiment never adjusts your calories.")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(PilotStyle.blue)
                    }
                    .padding(16)
                    .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))

                    Button {
                        pilot.run()
                    } label: {
                        HStack {
                            if pilot.working { ProgressView().tint(.white) }
                            Text(pilot.working ? "Inspecting locally…" : "Request Health access & inspect")
                        }
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(13)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(PilotStyle.blue)
                    .disabled(pilot.working)

                    Text(pilot.message)
                        .font(.footnote)
                        .foregroundStyle(PilotStyle.slate)
                        .accessibilityLabel(pilot.message)

                    if let result = pilot.observation {
                        Divider()
                        label("LOCAL OBSERVATIONS")
                        observationView(result)
                        Button("Clear results from memory") {
                            pilot.clear()
                        }
                        .font(.subheadline)
                        .foregroundStyle(PilotStyle.copper)
                        .disabled(pilot.working)
                    }

                    Divider()
                    label("IMPORTANT LIMITS")
                    Text("An exact matching sample UUID indicates the same HealthKit record appeared in both queries. It does not prove how the merged daily Health statistic was calculated, or whether calories were double-counted.")
                        .font(.subheadline)
                    Text("An empty result doesn't distinguish no data from denied or limited read access. The pilot checks only the latest visible workout from the last seven days.")
                        .font(.subheadline)
                        .foregroundStyle(PilotStyle.slate)
                    Text("This pilot reads no heart rate, sleep, weight, or dietary data. You can manage its Health permissions in iOS Settings.")
                        .font(.footnote)
                        .foregroundStyle(PilotStyle.slate)
                }
                .frame(maxWidth: 580, alignment: .leading)
                .padding(20)
                .frame(maxWidth: .infinity)
            }
            .background(Color(.systemBackground))
            .navigationTitle("Metron · Pilot")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func observationView(_ result: PilotObservation) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Latest workout: \(result.workoutStart.formatted(date: .abbreviated, time: .shortened))")
                .font(.subheadline.weight(.medium))
            HStack(spacing: 12) {
                metric("Associated step records", value: "\(result.associatedSampleCount)")
                metric("Day-query records", value: "\(result.dailyRawSampleCount)")
            }
            metric("Identical sample UUIDs in both queries", value: "\(result.identicalSampleCount)")
            Text("The matching records sum to \(Int(result.identicalSampleSteps.rounded())) steps in their original samples—not necessarily steps credited to the merged daily total.")
                .font(.footnote)
                .foregroundStyle(PilotStyle.slate)

            Divider()
            label("HEALTHKIT DAILY STATISTIC")
            Text(result.dailyStatistic.map { "\(Int($0.rounded())) steps" } ?? "Not available")
                .font(.title3.weight(.medium))
            ForEach(result.sourceTotals) { row in
                HStack {
                    Text(row.name)
                        .foregroundStyle(PilotStyle.slate)
                    Spacer()
                    Text("\(Int(row.steps.rounded()))")
                        .monospacedDigit()
                }
                .font(.footnote)
            }

            if result.dailyQueryCapped || result.associatedQueryCapped {
                Text("A sample query reached its 4,000-record cap. Its membership comparison is incomplete.")
                    .foregroundStyle(PilotStyle.copper)
                    .font(.subheadline)
            }
            if result.crossesDayBoundary {
                Text("This workout extends past local midnight. The one-day comparison cannot describe the whole workout.")
                    .foregroundStyle(PilotStyle.copper)
                    .font(.subheadline)
            }
            Text("Research status: sample identity observed when available; contribution to daily merged steps remains unverified.")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(PilotStyle.ink)
        }
        .padding(16)
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
    }

    private func label(_ text: String) -> some View {
        Text(text).font(.caption.weight(.semibold))
            .tracking(1.1)
            .foregroundStyle(PilotStyle.slate)
    }

    private func metric(_ caption: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(caption).font(.caption).foregroundStyle(PilotStyle.slate)
            Text(value).font(.title2.monospacedDigit().weight(.semibold))
                .foregroundStyle(PilotStyle.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
