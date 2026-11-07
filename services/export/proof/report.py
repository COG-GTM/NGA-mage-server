#!/usr/bin/env python3
"""Derive local-demo SOO 5.5 evidence from the append-only exercise event log."""
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path
from statistics import mean


def utc(value):
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('timestamps must carry a timezone')
    return parsed


def missing(reason):
    return {'value': None, 'status': 'not observed/not measurable', 'reason': reason}


def summarize(events):
    def select(kind):
        return [e for e in events if e['type'] == kind]

    starts, ends = select('window_started'), select('window_ended')
    if len(starts) != 1 or len(ends) != 1:
        raise ValueError('exactly one complete observation window is required')
    if events[0] is not starts[0] or events[-1] is not ends[0]:
        raise ValueError('events must be contained in the observation window')
    if not select('exercise_passed') or select('exercise_failed'):
        raise ValueError('refusing a success report for an incomplete or failed exercise')
    previous = -1
    for event in events:
        utc(event['timestamp'])
        elapsed = event['elapsed_ms']
        if not isinstance(elapsed, (int, float)) or elapsed < previous:
            raise ValueError('monotonic event times must be ordered')
        previous = elapsed
    start, end = starts[0], ends[0]
    duration = (end['elapsed_ms'] - start['elapsed_ms']) / 1000
    if duration <= 0:
        raise ValueError('observation window must have positive duration')
    deployments = select('deployment_verified')
    first_by_revision = {}
    for deployment in deployments:
        if not deployment.get('evidence') or not deployment.get('acceptance'):
            raise ValueError('deployment requires runtime acceptance evidence')
        first_by_revision.setdefault(deployment['revision'], deployment)
    lead_samples = []
    for revision, deployment in first_by_revision.items():
        committed = deployment.get('change_committed_at')
        if committed is None:
            continue
        seconds = (utc(deployment['timestamp']) - utc(committed)).total_seconds()
        if seconds < 0:
            raise ValueError('deployment precedes source commit')
        lead_samples.append({'revision': revision, 'committed_at': committed,
                             'verified_at': deployment['timestamp'], 'seconds': seconds})
    detected, recovered = {}, {}
    for kind, dest in [('incident_detected', detected), ('incident_recovered', recovered)]:
        for event in select(kind):
            key = event['incident_id']
            if key in dest:
                raise ValueError('duplicate incident boundary')
            dest[key] = event
    if recovered.keys() - detected.keys():
        raise ValueError('recovery without observed failure')
    recovery_samples = []
    for key, event in recovered.items():
        detection = detected[key]
        seconds = (event['elapsed_ms'] - detection['elapsed_ms']) / 1000
        if seconds < 0:
            raise ValueError('recovery precedes detection')
        recovery_samples.append({'incident_id': key, 'detected_at': detection['timestamp'],
                                 'recovered_at': event['timestamp'], 'seconds': seconds,
                                 'acceptance': event['criterion']})
    assertions = select('assertion')
    if any(e['result'] != 'passed' for e in assertions):
        raise ValueError('exercise contains non-passing assertions')
    return {
        'schema_version': 1,
        'scope': 'isolated local public-code demonstration; NOT federal contract or production performance',
        'window': {'start_utc': start['timestamp'], 'end_utc': end['timestamp'],
                   'duration_seconds': duration, 'clock': 'UTC timestamps; monotonic durations for window/recovery'},
        'provenance': {key: start.get(key) for key in ['revision', 'runtime_revision', 'worktree_dirty', 'image', 'image_id', 'node']},
        'metrics': {
            'deployment_frequency': {
                'value': len(deployments), 'unit': 'verified local release transitions per observation window',
                'denominator_seconds': duration, 'samples': deployments,
                'definition': 'A running release transition counts only after four authenticated exports complete and download. Baseline, cutover and rollback count; bootstrap/health-only starts, commits, PRs and same-revision incident restarts do not. No per-day extrapolation.'},
            'lead_time_for_changes': {
                'value': mean(s['seconds'] for s in lead_samples), 'unit': 'seconds', 'denominator_changes': len(lead_samples),
                'samples': lead_samples,
                'definition': 'Mean Git committer timestamp to first verified LOCAL deployment in this window, once per unique runtime source revision. Includes idle time; not coding time, merge-to-production time or labor saved.'
            } if lead_samples else missing('No source commit timestamp paired with a verified local deployment'),
            'demo_mttr': {
                'value': mean(s['seconds'] for s in recovery_samples), 'unit': 'seconds',
                'denominator_recovered_incidents': len(recovery_samples), 'unrecovered_incidents': len(detected.keys() - recovered.keys()),
                'samples': recovery_samples,
                'definition': 'Mean first observed Failed authenticated export to all four fresh authenticated exports downloaded and matched baseline after an intentional exporter stop/restart. Includes the scripted 2-second isolation check. Not production MTTR.'
            } if recovery_samples else missing('No observed failure paired with verified recovery'),
            'labor_hours_saved': missing('No measured manual baseline, comparable task cohort, human touch-time or quality-adjusted rework data'),
            'mission_efficiency_change': missing('No operational users, mission outcome baseline or comparable mission workload'),
            'production_deployments': missing('No production telemetry or deployments performed'),
            'production_mttr': missing('No production incidents observed'),
            'velocity': missing('No sprint cadence, estimates or historical accepted story points; demonstration backlog is not velocity'),
        },
        'validation': {'passed_assertions': len(assertions), 'exercise_completed': True,
                       'rollback_observed': bool(select('rollback_verified'))},
        'limitations': [
            'One host, one seeded observation and one seeded location; not load, scalability, resilience or HA evidence.',
            'Exporter shares MongoDB, file stores and core MAGE adapters. Not independently owned data or a fully decoupled estate.',
            'Failed jobs remain Failed; recovery verifies newly submitted jobs, not automatic replay.',
            'No continuous government tool access, deployment history or production observability is established by a saved demo report.',
            'Short-window deployment counts and one intentional fault do not predict steady-state DORA performance.',
        ],
    }


def render(report):
    lines = ['# SOO 5.5 — measured local demonstration', '', report['scope'], '',
             f"Observation window: {report['window']['start_utc']} → {report['window']['end_utc']} ({report['window']['duration_seconds']:.3f} seconds).", '',
             '| Metric | Measured value | Denominator / interpretation |', '|---|---|---|']
    for name, metric in report['metrics'].items():
        value = metric['value']
        if value is None:
            lines.append(f"| {name} | not observed/not measurable | {metric['reason']} |")
        else:
            denominator = metric.get('denominator_changes', metric.get('denominator_recovered_incidents', metric.get('denominator_seconds')))
            lines.append(f"| {name} | {value:.3f} {metric['unit']} | {denominator} |")
    lines += ['', '## Definitions', '']
    for name, metric in report['metrics'].items():
        if 'definition' in metric:
            lines += [f"- **{name}:** {metric['definition']}"]
    lines += ['', '## Limits', ''] + ['- ' + text for text in report['limitations']]
    lines += ['', f"Runtime revision: `{report['provenance']['runtime_revision']}`. Harness revision: `{report['provenance']['revision']}`.",
              f"Raw-event SHA-256: `{report['raw_event_sha256']}`.", '']
    return '\n'.join(lines)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('events', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    raw = args.events.read_bytes()
    report = summarize([json.loads(line) for line in raw.splitlines() if line])
    report['raw_event_sha256'] = hashlib.sha256(raw).hexdigest()
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / 'kpi.json').write_text(json.dumps(report, indent=2) + '\n')
    (args.output / 'KPI-REPORT.md').write_text(render(report))
    print(json.dumps(report, indent=2))
