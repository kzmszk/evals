import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  getInputProps,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Utterance = {
  speaker: 'teacher' | 'student';
  text: string;
  startSec: number;
  endSec: number;
  emphasis?: {text: string; startSec: number; endSec: number; fallback?: boolean}[];
};

type Scene = {
  id: string;
  type: 'title' | 'hook' | 'quiz' | 'answer' | 'explain' | 'myth_bust' | 'takeaway' | 'sources';
  startSec: number;
  endSec: number;
  evidence?: {level: string; note: string; raw: string}[];
  onScreen: {
    headline?: string;
    subhead?: string;
    question?: string;
    options?: string[];
    items?: string[];
    sources?: string[];
    badge?: string;
    mark?: string;
  };
  utterances: Utterance[];
};

type Timeline = {
  fps: number;
  totalSec: number;
  audio: string;
  meta: {title?: string; accentColor?: string};
  scenes: Scene[];
};

const fallbackTimeline: Timeline = {
  fps: 30,
  totalSec: 12,
  audio: 'narration.wav',
  meta: {title: 'Health Video', accentColor: '#5CD6A4'},
  scenes: [
    {
      id: 'title-01',
      type: 'title',
      startSec: 0,
      endSec: 12,
      onScreen: {headline: 'Health Video', subhead: 'timeline.json を props で渡してください'},
      utterances: [],
    },
  ],
};

const secToFrame = (sec: number, fps: number) => Math.max(0, Math.round(sec * fps));

export const Root: React.FC = () => {
  const props = getInputProps() as Partial<Timeline>;
  const timeline = {...fallbackTimeline, ...props, meta: {...fallbackTimeline.meta, ...props.meta}} as Timeline;
  return (
    <Composition
      id="HealthVideo"
      component={HealthVideo}
      durationInFrames={Math.max(1, secToFrame(timeline.totalSec, timeline.fps))}
      fps={timeline.fps}
      width={1920}
      height={1080}
      defaultProps={timeline}
    />
  );
};

const HealthVideo: React.FC<Timeline> = (timeline) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={styles.stage}>
      <Audio src={staticFile(timeline.audio)} />
      <TopBar title={timeline.meta.title ?? 'Health Video'} accent={timeline.meta.accentColor ?? '#5CD6A4'} />
      {timeline.scenes.map((scene) => {
        const start = secToFrame(scene.startSec, fps);
        const duration = Math.max(1, secToFrame(scene.endSec - scene.startSec, fps));
        return (
          <Sequence key={scene.id} from={start} durationInFrames={duration}>
            <SceneFrame scene={scene} accent={timeline.meta.accentColor ?? '#5CD6A4'} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const TopBar: React.FC<{title: string; accent: string}> = ({title, accent}) => (
  <div style={styles.topBar}>
    <div style={{...styles.topRule, background: accent}} />
    <div style={styles.topTitle}>{title}</div>
  </div>
);

const SceneFrame: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localSec = frame / fps;
  const enter = spring({frame, fps, config: {damping: 180, stiffness: 90}});
  const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const activeSpeaker = activeSpeakerAt(scene, scene.startSec + localSec);
  return (
    <AbsoluteFill style={{...styles.scene, opacity}}>
      <div style={{...styles.pulse, transform: `scale(${0.9 + enter * 0.1})`, borderColor: accent}} />
      {renderSceneContent(scene, accent, localSec)}
      <SpeakerRail active={activeSpeaker} accent={accent} />
    </AbsoluteFill>
  );
};

const renderSceneContent = (scene: Scene, accent: string, localSec: number) => {
  if (scene.type === 'quiz') {
    return <QuizScene scene={scene} accent={accent} />;
  }
  if (scene.type === 'answer') {
    return <AnswerScene scene={scene} accent={accent} />;
  }
  if (scene.type === 'myth_bust') {
    return <MythScene scene={scene} accent={accent} />;
  }
  if (scene.type === 'takeaway') {
    return <TakeawayScene scene={scene} accent={accent} />;
  }
  if (scene.type === 'sources') {
    return <SourcesScene scene={scene} accent={accent} />;
  }
  return <DefaultScene scene={scene} accent={accent} localSec={localSec} />;
};

const DefaultScene: React.FC<{scene: Scene; accent: string; localSec: number}> = ({scene, accent, localSec}) => {
  const headline = activeEmphasis(scene, scene.startSec + localSec) ?? scene.onScreen.headline;
  return (
    <div style={styles.main}>
      {scene.onScreen.badge ? <Badge label={scene.onScreen.badge} accent={accent} /> : null}
      <h1 style={styles.headline}>{headline}</h1>
      {scene.onScreen.subhead ? <p style={styles.subhead}>{scene.onScreen.subhead}</p> : null}
      <Evidence evidence={scene.evidence} />
    </div>
  );
};

const QuizScene: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => (
  <div style={styles.quiz}>
    <h1 style={styles.question}>{scene.onScreen.question}</h1>
    <div style={styles.options}>
      {(scene.onScreen.options ?? []).slice(0, 6).map((option, index) => (
        <div key={option} style={{...styles.option, borderColor: index % 2 === 0 ? accent : '#3d4b55'}}>
          {option}
        </div>
      ))}
    </div>
  </div>
);

const AnswerScene: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => (
  <div style={styles.answer}>
    <div style={{...styles.answerMark, color: accent}}>{scene.onScreen.mark ?? '○'}</div>
    <h1 style={styles.answerHeadline}>{scene.onScreen.headline}</h1>
  </div>
);

const MythScene: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => (
  <div style={styles.main}>
    <div style={styles.kiri}>ぶった斬り</div>
    <h1 style={styles.myth}>{scene.onScreen.headline}</h1>
    <div style={{...styles.strike, background: accent}} />
    <p style={styles.subhead}>{scene.onScreen.subhead}</p>
  </div>
);

const TakeawayScene: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => (
  <div style={styles.takeaway}>
    <h1 style={styles.takeawayTitle}>{scene.onScreen.headline}</h1>
    {(scene.onScreen.items ?? []).slice(0, 3).map((item, index) => (
      <div key={item} style={styles.takeawayRow}>
        <span style={{...styles.takeawayNum, background: accent}}>{index + 1}</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const SourcesScene: React.FC<{scene: Scene; accent: string}> = ({scene, accent}) => (
  <div style={styles.sources}>
    <h1 style={styles.sourcesTitle}>{scene.onScreen.headline}</h1>
    {(scene.onScreen.sources ?? []).map((source) => (
      <p key={source} style={styles.sourceItem}>
        <span style={{color: accent}}>■</span> {source}
      </p>
    ))}
  </div>
);

const Badge: React.FC<{label: string; accent: string}> = ({label, accent}) => (
  <div style={{...styles.badge, borderColor: accent, color: accent}}>{label}</div>
);

const Evidence: React.FC<{evidence?: {level: string; note: string; raw: string}[]}> = ({evidence}) => {
  if (!evidence || evidence.length === 0) {
    return null;
  }
  return (
    <div style={styles.evidence}>
      {evidence.slice(0, 2).map((item) => (
        <span key={item.raw}>強度{item.level}: {item.note || '根拠あり'}</span>
      ))}
    </div>
  );
};

const SpeakerRail: React.FC<{active?: string; accent: string}> = ({active, accent}) => (
  <div style={styles.speakerRail}>
    <Speaker label="講師" active={active === 'teacher'} accent={accent} />
    <Speaker label="生徒" active={active === 'student'} accent={accent} />
  </div>
);

const Speaker: React.FC<{label: string; active: boolean; accent: string}> = ({label, active, accent}) => (
  <div style={{...styles.speaker, borderColor: active ? accent : '#33414a', color: active ? '#ffffff' : '#9aa8ad'}}>
    <span style={{...styles.speakerDot, background: active ? accent : '#41505a'}} />
    {label}
  </div>
);

const activeSpeakerAt = (scene: Scene, absoluteSec: number) => {
  return scene.utterances.find((utterance) => absoluteSec >= utterance.startSec && absoluteSec <= utterance.endSec)?.speaker;
};

const activeEmphasis = (scene: Scene, absoluteSec: number) => {
  for (const utterance of scene.utterances) {
    for (const emphasis of utterance.emphasis ?? []) {
      if (absoluteSec >= emphasis.startSec && absoluteSec <= emphasis.endSec) {
        return emphasis.text;
      }
    }
  }
  return undefined;
};

const styles: Record<string, React.CSSProperties> = {
  stage: {
    background: '#101418',
    color: '#eef7f3',
    fontFamily: '"Noto Sans JP", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    left: 72,
    right: 72,
    top: 42,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    color: '#b8c6c3',
    fontSize: 24,
    zIndex: 5,
  },
  topRule: {width: 72, height: 6, borderRadius: 3},
  topTitle: {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  scene: {padding: '130px 120px 110px'},
  pulse: {
    position: 'absolute',
    right: -160,
    top: 160,
    width: 520,
    height: 520,
    border: '3px solid',
    borderRadius: '50%',
    opacity: 0.16,
  },
  main: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headline: {
    fontSize: 112,
    lineHeight: 1.05,
    margin: '22px 0',
    maxWidth: 1380,
    letterSpacing: 0,
  },
  subhead: {
    fontSize: 44,
    lineHeight: 1.45,
    color: '#cbd8d4',
    maxWidth: 1280,
    margin: 0,
  },
  badge: {
    display: 'inline-flex',
    border: '2px solid',
    borderRadius: 6,
    padding: '10px 16px',
    fontSize: 30,
    fontWeight: 800,
  },
  evidence: {
    display: 'flex',
    gap: 16,
    marginTop: 34,
    color: '#aebbb8',
    fontSize: 28,
  },
  quiz: {display: 'grid', gridTemplateRows: 'auto 1fr', gap: 44, height: '100%'},
  question: {fontSize: 58, lineHeight: 1.25, margin: 0, maxWidth: 1560},
  options: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22},
  option: {
    border: '2px solid',
    borderRadius: 8,
    padding: '24px 28px',
    fontSize: 31,
    lineHeight: 1.35,
    background: '#151d22',
  },
  answer: {height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'},
  answerMark: {fontSize: 220, lineHeight: 0.9, fontWeight: 900},
  answerHeadline: {fontSize: 74, lineHeight: 1.18, textAlign: 'center', maxWidth: 1420},
  kiri: {fontSize: 34, color: '#ffdf82', fontWeight: 900, marginBottom: 22},
  myth: {fontSize: 90, lineHeight: 1.12, margin: 0, maxWidth: 1320},
  strike: {width: 1060, height: 10, transform: 'rotate(-2deg)', margin: '16px 0 30px'},
  takeaway: {height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30},
  takeawayTitle: {fontSize: 74, margin: '0 0 18px'},
  takeawayRow: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    alignItems: 'center',
    gap: 22,
    fontSize: 42,
    lineHeight: 1.35,
  },
  takeawayNum: {
    width: 60,
    height: 60,
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#07100d',
    fontWeight: 900,
  },
  sources: {height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'},
  sourcesTitle: {fontSize: 64, margin: '0 0 28px'},
  sourceItem: {fontSize: 30, lineHeight: 1.35, color: '#d3dedb', margin: '7px 0'},
  speakerRail: {
    position: 'absolute',
    left: 120,
    right: 120,
    bottom: 40,
    display: 'flex',
    justifyContent: 'center',
    gap: 18,
  },
  speaker: {
    border: '2px solid',
    borderRadius: 8,
    padding: '12px 20px',
    minWidth: 130,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    fontSize: 28,
    fontWeight: 800,
    background: '#141b20',
  },
  speakerDot: {width: 14, height: 14, borderRadius: 7},
};
