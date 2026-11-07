"""Synthetic arithmetic fixtures only; these are never evidence of measured KPIs."""
import copy
import unittest
from report import summarize


def event(kind, ms, **kw):
    return dict(type=kind, elapsed_ms=ms, timestamp=f'2026-01-01T00:00:{ms // 1000:02d}Z', **kw)


class ReportTests(unittest.TestCase):
    def events(self):
        return [event('window_started', 0),
                event('deployment_verified', 1000, revision='abc', change_committed_at='2025-12-31T23:59:59Z', evidence='off/', acceptance='four exports'),
                event('incident_detected', 2000, incident_id='1'),
                event('incident_recovered', 5000, incident_id='1', criterion='content parity'),
                event('assertion', 6000, result='passed'),
                event('exercise_passed', 7000), event('window_ended', 10000)]

    def test_arithmetic(self):
        result = summarize(self.events())
        self.assertEqual(result['metrics']['deployment_frequency']['value'], 1)
        self.assertEqual(result['metrics']['lead_time_for_changes']['value'], 2)
        self.assertEqual(result['metrics']['demo_mttr']['value'], 3)
        self.assertEqual(result['window']['duration_seconds'], 10)

    def test_unknown_is_null_not_zero(self):
        events = [event('window_started', 0), event('exercise_passed', 1000), event('window_ended', 2000)]
        result = summarize(events)['metrics']
        for metric in ['lead_time_for_changes', 'demo_mttr', 'labor_hours_saved', 'velocity', 'production_mttr']:
            self.assertIsNone(result[metric]['value'])

    def test_repeated_revision_not_double_counted_as_change(self):
        events = self.events()
        repeated = copy.deepcopy(events[1]); repeated['elapsed_ms'] = 1500
        events.insert(2, repeated)
        metrics = summarize(events)['metrics']
        self.assertEqual(metrics['deployment_frequency']['value'], 2)
        self.assertEqual(metrics['lead_time_for_changes']['denominator_changes'], 1)

    def test_missing_end_rejected(self):
        with self.assertRaises(ValueError): summarize(self.events()[:-1])

    def test_failed_exercise_rejected(self):
        events = self.events(); events[-2]['type'] = 'exercise_failed'
        with self.assertRaises(ValueError): summarize(events)

    def test_failed_assertion_rejected(self):
        events = self.events(); events[-3]['result'] = 'failed'
        with self.assertRaises(ValueError): summarize(events)

    def test_backwards_time_rejected(self):
        events = self.events(); events[3]['elapsed_ms'] = 1000
        with self.assertRaises(ValueError): summarize(events)

    def test_recovery_without_detection_rejected(self):
        events = self.events(); del events[2]
        with self.assertRaises(ValueError): summarize(events)

    def test_commit_after_deployment_rejected(self):
        events = self.events(); events[1]['change_committed_at'] = '2027-01-01T00:00:00Z'
        with self.assertRaises(ValueError): summarize(events)

    def test_unrecovered_is_not_zero_recovery(self):
        events = self.events(); del events[3]
        self.assertIsNone(summarize(events)['metrics']['demo_mttr']['value'])


if __name__ == '__main__':
    unittest.main()
