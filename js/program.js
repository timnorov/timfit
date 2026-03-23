window.TF = window.TF || {};

// Day index (JS getDay()) → session type
// JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
TF.DAY_SESSION_MAP = {
  1: 'Push A',
  2: 'Pull A',
  3: 'Legs A',
  4: 'Push B',
  5: 'Pull B',
  6: 'Legs B',
  0: 'Rest'
};

TF.SESSION_DAY_MAP = {
  'Push A': 1,
  'Pull A': 2,
  'Legs A': 3,
  'Push B': 4,
  'Pull B': 5,
  'Legs B': 6,
  'Rest': 0
};

TF.SESSION_KEY_MAP = {
  'Push A': 'session.push.a',
  'Pull A': 'session.pull.a',
  'Legs A': 'session.legs.a',
  'Push B': 'session.push.b',
  'Pull B': 'session.pull.b',
  'Legs B': 'session.legs.b',
  'Rest': 'session.rest'
};

TF.PROGRAM = {
  'Push A': {
    type: 'Push A',
    dayKey: 'day.monday',
    muscles: ['muscle.upper.chest', 'muscle.shoulders', 'muscle.triceps'],
    theme: 'Strength',
    warmup: false,
    exercises: [
      {
        id: 'incline_barbell_press',
        name: 'Incline Barbell Press (30°)',
        gif: 'assets/gifs/incline_barbell_press.png',
        muscles: ['Upper Pectorals', 'Front Delts', 'Triceps'],
        muscleKeys: ['muscle.upper.chest', 'muscle.front.delts', 'muscle.triceps'],
        sets: 4, repsMin: 4, repsMax: 6, rest: 180, rpe: '8–9',
        equipment: 'Barbell + incline bench',
        grip: 'Overhand, index fingers just inside the rings',
        cuesEn: 'Set bench STRICTLY to 30°. Retract and depress scapulae before unracking. Bar touches upper chest below collarbone. Controlled 2-sec descent. Slight arc path — not straight up. Hit this FIRST while completely fresh — upper chest is the priority. This angle maximally activates the clavicular head of pec major.',
        cuesRu: 'Угол скамьи СТРОГО 30°. Перед снятием штанги сведите лопатки и опустите их вниз. Гриф касается верхней части груди, ниже ключицы. Контролируемый опуск за 2 секунды. Траектория жима — лёгкая дуга, не строго вертикально. Выполняйте ПЕРВЫМ, пока полностью свежи — верхняя часть груди в приоритете. Угол 30° максимально нагружает ключичную головку большой грудной.',
        startingWeight: 60
      },
      {
        id: 'flat_bench_press',
        name: 'Barbell Flat Bench Press',
        gif: 'assets/gifs/flat_bench_press.png',
        muscles: ['Pectorals (Sternal)', 'Front Delts', 'Triceps'],
        muscleKeys: ['muscle.chest', 'muscle.front.delts', 'muscle.triceps'],
        sets: 4, repsMin: 6, repsMax: 8, rest: 150, rpe: '8',
        equipment: 'Barbell + flat bench',
        grip: 'Overhand, ~1.5× shoulder-width, ring fingers on rings',
        cuesEn: 'Retract and depress scapulae hard into bench. Slight natural lower-back arch. Bar to lower chest. Elbows 45–60° from torso — NOT flared out. Think "bend the bar outward". Drive feet into floor. Pause 1 sec on chest each rep.',
        cuesRu: 'Плотно сведите лопатки и прижмите их к скамье. Небольшой естественный прогиб в пояснице. Гриф опускается на нижнюю часть груди. Локти под углом 45–60° к торсу — НЕ разводите в стороны. Представьте, что хотите «согнуть гриф наружу». Упирайтесь ногами в пол. Пауза 1 секунда на груди.',
        startingWeight: 80
      },
      {
        id: 'seated_db_overhead_press',
        name: 'Seated Dumbbell Overhead Press',
        gif: 'assets/gifs/seated_db_overhead_press.png',
        muscles: ['Side Delts', 'Front Delts', 'Triceps', 'Upper Traps'],
        muscleKeys: ['muscle.side.delts', 'muscle.front.delts', 'muscle.triceps', 'muscle.traps'],
        sets: 4, repsMin: 8, repsMax: 10, rest: 120, rpe: '8',
        equipment: 'Dumbbells + adjustable bench',
        grip: 'Neutral at start (palms facing each other), rotate to semi-pronated at top',
        cuesEn: 'Bench at 80–90°, back fully supported, core braced. Elbows at shoulder height at bottom position. Press in slight arc overhead — do not aggressively lock out at top. Lower slowly for full stretch. Control the weight on the way down.',
        cuesRu: 'Скамья под углом 80–90°, спина полностью прижата, корпус напряжён. Локти на уровне плеч в нижней точке. Жим по лёгкой дуговой траектории вверх — не блокируйте резко в верхней точке. Медленный опуск до полного растяжения. Контролируйте вес на пути вниз.',
        startingWeight: 20
      },
      {
        id: 'cable_lateral_raise',
        name: 'Cable Lateral Raise — Single Arm',
        gif: 'assets/gifs/cable_lateral_raise.png',
        muscles: ['Medial Deltoid'],
        muscleKeys: ['muscle.side.delts'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Cable machine + D-handle',
        handle: 'Single D-handle',
        pulley: 'Lowest position (floor)',
        grip: 'Neutral, pinky slightly higher than thumb',
        cuesEn: 'Working arm FURTHEST from stack. Cable crosses in front of body. Raise to just above shoulder height. Lead with elbow. Zero body sway — this is not a cheat raise. Constant tension throughout — superior to dumbbells. Creates that rounded shoulder "cap" look.',
        cuesRu: 'Рабочая рука — ДАЛЬНЯЯ от стойки. Трос проходит перед телом. Поднимайте чуть выше уровня плеч. Ведите локтем. Никакого раскачивания — это не «чит». Постоянное натяжение на протяжении всего движения — лучше, чем с гантелями. Создаёт округлый «колпак» дельты.',
        note: 'Per side',
        startingWeight: 8
      },
      {
        id: 'tricep_bar_pushdown',
        name: 'Revolving Short Bar Pushdown',
        gif: 'assets/gifs/tricep_bar_pushdown.png',
        muscles: ['Triceps Lateral Head', 'Medial Head'],
        muscleKeys: ['muscle.triceps'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 60, rpe: '7',
        equipment: 'Cable machine + revolving short bar',
        handle: 'Revolving short bar (rotating handles)',
        pulley: 'Highest position (overhead)',
        grip: 'Overhand — rotating handles find natural wrist position',
        cuesEn: 'Elbows pinned at sides — only forearms move. Full extension at bottom, hold 1 sec squeeze. Rotating handles eliminate wrist strain completely. Clean lockout on every rep for full tricep contraction.',
        cuesRu: 'Локти прижаты к корпусу — двигаются только предплечья. Полное разгибание внизу, задержка 1 секунду. Вращающиеся ручки полностью устраняют нагрузку на запястья. Чёткий дожим на каждом повторении для полного сокращения трицепса.',
        startingWeight: 30
      },
      {
        id: 'overhead_tricep_extension',
        name: 'Revolving Short Bar Overhead Extension',
        gif: 'assets/gifs/overhead_tricep_extension.png',
        muscles: ['Triceps Long Head'],
        muscleKeys: ['muscle.triceps'],
        sets: 3, repsMin: 10, repsMax: 15, rest: 60, rpe: '7',
        equipment: 'Cable machine + revolving short bar',
        handle: 'Revolving short bar',
        pulley: 'Lowest position',
        facing: 'AWAY from stack',
        grip: 'Overhand, rotating handles',
        cuesEn: 'Face AWAY from cable stack. Elbows point forward and overhead. Hands descend behind head for deep long-head stretch. Long head only fully activates when arm is overhead. Extend to full lockout. Rotating handles allow secure grip for heavy loading.',
        cuesRu: 'Стоять СПИНОЙ к тросовой стойке. Локти направлены вперёд и вверх. Руки опускаются за голову для глубокого растяжения длинной головки. Длинная головка (65% трицепса) полностью активируется только при положении руки над головой. Полное разгибание. Вращающиеся ручки позволяют работать с большими весами безопасно.',
        startingWeight: 20
      },
      {
        id: 'cable_face_pull',
        name: 'Cable Face Pull',
        gif: 'assets/gifs/cable_face_pull.png',
        muscles: ['Rear Delts', 'Rotator Cuff', 'Upper Traps'],
        muscleKeys: ['muscle.rear.delts', 'muscle.traps'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '6–7',
        equipment: 'Cable machine + rope attachment',
        handle: 'Rope attachment',
        pulley: 'Face height (eye level)',
        grip: 'Overhand, thumbs pointing behind you',
        cuesEn: 'Pull toward forehead, splitting rope apart. Elbows end above shoulder height pointed outward. MANDATORY every push day — shoulder health is non-negotiable. Light weight, full range. Counteracts internal rotation stress from all pressing.',
        cuesRu: 'Тяните к лбу, разводя верёвку в стороны. Локти заканчивают движение выше плеч, направлены наружу. ОБЯЗАТЕЛЬНО в каждый день жимов — здоровье плеч прежде всего. Лёгкий вес, полная амплитуда. Компенсирует внутреннюю ротацию плеча от жимовых упражнений.',
        startingWeight: 20
      }
    ]
  },

  'Pull A': {
    type: 'Pull A',
    dayKey: 'day.tuesday',
    muscles: ['muscle.back', 'muscle.biceps', 'muscle.rear.delts'],
    theme: 'Strength',
    warmup: false,
    exercises: [
      {
        id: 'weighted_pullup',
        name: 'Weighted Pull-Up',
        gif: 'assets/gifs/weighted_pullup.png',
        muscles: ['Lats', 'Biceps', 'Lower Traps', 'Core'],
        muscleKeys: ['muscle.lats', 'muscle.biceps', 'muscle.traps', 'muscle.core'],
        sets: 4, repsMin: 6, repsMax: 8, rest: 180, rpe: '8–9',
        equipment: 'Pull-up bar + weight belt',
        grip: 'Shoulder-width underhand (supinated/chin-up) OR neutral',
        cuesEn: 'Full dead hang at bottom — do not cheat the stretch. Drive elbows DOWN toward hips (not back). Chin clears bar. Add weight belt once 3×8 bodyweight is comfortable. Substitute: assisted machine with same grip and cues if needed.',
        cuesRu: 'Полный вис на прямых руках внизу — не срезайте растяжение. Тяните локти ВНИЗ к бёдрам (не назад). Подбородок выше перекладины. Добавляйте дополнительный вес, когда 3×8 с весом тела станет комфортным. Замена: тренажёр для подтягиваний с той же хваткой.',
        startingWeight: 0
      },
      {
        id: 'barbell_bent_over_row',
        name: 'Barbell Bent-Over Row (Overhand)',
        gif: 'assets/gifs/barbell_bent_over_row.png',
        muscles: ['Mid Traps', 'Rhomboids', 'Rear Delts', 'Lats'],
        muscleKeys: ['muscle.traps', 'muscle.back', 'muscle.rear.delts', 'muscle.lats'],
        sets: 4, repsMin: 6, repsMax: 8, rest: 180, rpe: '8',
        equipment: 'Barbell',
        grip: 'Overhand (pronated), slightly wider than shoulder-width',
        cuesEn: 'Hip hinge to ~45° torso angle (NOT nearly horizontal). Bar to lower sternum/upper abdomen. Elbows flare slightly OUT. Lower bar fully (arms straight) for complete lat stretch. No jerking, no leg drive. Brace core — lower back neutral.',
        cuesRu: 'Наклон корпуса ~45° (НЕ почти горизонтально). Гриф к нижней части груди/верху живота. Локти немного разведены наружу. Полное опускание грифа (прямые руки) для растяжения широчайших. Без рывков, без ног. Корпус зафиксирован — поясница нейтральна.',
        startingWeight: 60
      },
      {
        id: 'seated_cable_row_neutral',
        name: 'Seated Cable Row — Neutral Grip (V-Bar)',
        gif: 'assets/gifs/seated_cable_row_neutral.png',
        muscles: ['Lats', 'Mid Traps', 'Biceps'],
        muscleKeys: ['muscle.lats', 'muscle.traps', 'muscle.biceps'],
        sets: 3, repsMin: 8, repsMax: 10, rest: 90, rpe: '8',
        equipment: 'Cable machine + V-bar',
        handle: 'V-bar or double D-handles',
        pulley: 'Lowest position',
        grip: 'Neutral (palms facing each other)',
        cuesEn: 'Lean slightly forward at start to stretch lats. Pull to lower abdomen. Drive elbows straight back past sides. Squeeze mid-back hard — hold 1 sec. 2–3 sec eccentric. Torso stays still — arms only.',
        cuesRu: 'Небольшой наклон вперёд в начале для растяжения широчайших. Тяните к нижней части живота. Локти идут строго назад мимо боков. Сильно сожмите середину спины — держите 1 секунду. Эксцентрическая фаза 2–3 секунды. Корпус неподвижен — только руки.',
        startingWeight: 60
      },
      {
        id: 'cable_face_pull_pull_a',
        name: 'Cable Face Pull',
        gif: 'assets/gifs/cable_face_pull.png',
        muscles: ['Rear Delts', 'Rotator Cuff', 'Upper Traps'],
        muscleKeys: ['muscle.rear.delts', 'muscle.traps'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '6–7',
        equipment: 'Cable machine + rope attachment',
        handle: 'Rope attachment',
        pulley: 'Face height (eye level)',
        grip: 'Overhand, thumbs pointing behind you',
        cuesEn: 'Pull toward forehead, splitting rope apart. Elbows end above shoulder height pointed outward. Shoulder health maintenance — included every session.',
        cuesRu: 'Тяните к лбу, разводя верёвку в стороны. Локти заканчивают выше плеч, направлены наружу. Профилактика плечевых суставов — включено в каждую тренировку.',
        startingWeight: 20
      },
      {
        id: 'ez_bar_curl',
        name: 'EZ-Bar Curl (Standing)',
        gif: 'assets/gifs/ez_bar_curl.png',
        muscles: ['Biceps Brachii', 'Brachialis'],
        muscleKeys: ['muscle.biceps'],
        sets: 3, repsMin: 8, repsMax: 10, rest: 90, rpe: '8',
        equipment: 'EZ-bar',
        grip: 'Inner (semi-supinated) angled grip — reduces wrist strain',
        cuesEn: 'Arms fully extended at bottom — no half reps. Curl until forearms just past vertical. Elbows stay at sides. Slow 2–3 sec descent. Zero body swing — if swinging, weight is too heavy.',
        cuesRu: 'Полное разгибание рук внизу — никаких неполных повторений. Сгибайте до тех пор, пока предплечья не пройдут вертикаль. Локти прижаты к корпусу. Медленный опуск 2–3 секунды. Никакого раскачивания — если раскачиваетесь, вес слишком большой.',
        startingWeight: 30
      },
      {
        id: 'hammer_curl',
        name: 'Hammer Curl — Dumbbell, Alternating',
        gif: 'assets/gifs/hammer_curl.png',
        muscles: ['Brachialis', 'Brachioradialis', 'Bicep Long Head'],
        muscleKeys: ['muscle.biceps'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 60, rpe: '7',
        equipment: 'Dumbbells',
        grip: 'Neutral throughout — palms facing body. NO supination.',
        cuesEn: 'Alternate arms each rep. Slight forward lean at bottom for better brachialis stretch. Curl to shoulder height, lower fully. Alternating = full neural focus per arm + fixes strength imbalances between sides.',
        cuesRu: 'Чередуйте руки на каждом повторении. Лёгкий наклон вперёд внизу для лучшего растяжения брахиалиса. Сгибайте до уровня плеч, опускайте полностью. Поочерёдное выполнение = полная нейронная концентрация на каждой руке + устраняет дисбаланс силы.',
        note: 'Per side',
        startingWeight: 16
      }
    ]
  },

  'Legs A': {
    type: 'Legs A',
    dayKey: 'day.wednesday',
    muscles: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings', 'muscle.calves', 'muscle.core'],
    theme: 'Strength',
    warmup: true,
    exercises: [
      {
        id: 'barbell_back_squat',
        name: 'Barbell Back Squat',
        gif: 'assets/gifs/barbell_back_squat.png',
        muscles: ['Quads', 'Glutes', 'Hamstrings', 'Core', 'Spinal Erectors'],
        muscleKeys: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings', 'muscle.core'],
        sets: 4, repsMin: 4, repsMax: 6, rest: 180, rpe: '8–9',
        equipment: 'Barbell + squat rack',
        grip: 'Overhand, slightly wider than shoulder-width',
        note: 'Low-bar position on rear delts. Stance: shoulder-width, toes 15–30° out',
        cuesEn: 'Big breath into belly, brace 360° around core. Break at hips and knees simultaneously. Knees track over toes — drive them out. Descend to parallel or below. Do NOT let chest fall forward. Low-bar = more hip and glute dominant. APT warmup improves depth and glute engagement.',
        cuesRu: 'Глубокий вдох в живот, зафиксируйте корпус на 360°. Начинайте движение одновременно тазом и коленями. Колени идут по линии носков — разводите их наружу. Приседайте до параллели или ниже. НЕ допускайте падения груди вперёд. Низкая штанга = больше нагрузки на бёдра и ягодицы. Разминка APT улучшает глубину и включение ягодиц.',
        startingWeight: 80
      },
      {
        id: 'barbell_hip_thrust',
        name: 'Barbell Hip Thrust',
        gif: 'assets/gifs/barbell_hip_thrust.png',
        muscles: ['Glutes (Maximus + Medius)', 'Hamstrings'],
        muscleKeys: ['muscle.glutes', 'muscle.hamstrings'],
        sets: 4, repsMin: 8, repsMax: 12, rest: 120, rpe: '8',
        equipment: 'Barbell + flat bench + thick barbell pad',
        grip: 'Overhand on barbell, hands outside hips',
        cuesEn: 'Upper back (mid-scapula, NOT neck) on flat bench. Thick pad in hip crease. Feet flat, shoulder-width, toes slightly out. Drive through heels AND mid-foot. Chin tucked throughout. Squeeze glutes MAXIMALLY at top — hold 1 sec. Hips fully extended at top. REPLACES DEADLIFT — superior glute activation per EMG research.',
        cuesRu: 'Верхняя часть спины (середина лопатки, НЕ шея) на скамье. Толстая подушка в сгибе бедра. Стопы плоско, на ширине плеч, носки чуть наружу. Жмите через пятки И среднюю часть стопы. Подбородок прижат на протяжении всего движения. Максимально сожмите ягодицы вверху — держите 1 секунду. ЗАМЕНЯЕТ СТАНОВУЮ ТЯГУ — лучшая активация ягодиц согласно ЭМГ-исследованиям.',
        startingWeight: 60
      },
      {
        id: 'leg_press',
        name: 'Leg Press (45°)',
        gif: 'assets/gifs/leg_press.png',
        muscles: ['Quads', 'Glutes', 'Hamstrings'],
        muscleKeys: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 120, rpe: '8',
        equipment: '45° leg press machine',
        note: 'Foot position: mid-plate, shoulder-width, toes 15–20° out',
        cuesEn: 'Lower until knees reach ~90°. Drive through FULL foot. Do NOT lock out knees at top — releases tension. Continuous tension throughout entire set.',
        cuesRu: 'Опускайте до угла ~90° в коленях. Жмите через ВСЮ стопу. НЕ разгибайте колени полностью вверху — это снимает нагрузку. Постоянное напряжение на протяжении всего подхода.',
        startingWeight: 100
      },
      {
        id: 'lying_leg_curl',
        name: 'Lying Leg Curl (Machine)',
        gif: 'assets/gifs/lying_leg_curl.png',
        muscles: ['Biceps Femoris', 'Semitendinosus'],
        muscleKeys: ['muscle.hamstrings'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 90, rpe: '7–8',
        equipment: 'Lying leg curl machine',
        cuesEn: 'Pad just above Achilles — NOT mid-calf. Toes pointed slightly. Full stretch at bottom on every rep — critical for hamstring hypertrophy. Slow 3-sec eccentric.',
        cuesRu: 'Валик чуть выше ахиллова сухожилия — НЕ на середине икры. Носки слегка вытянуты. Полное растяжение внизу на каждом повторении — критически важно для роста бицепса бедра. Медленная эксцентрическая фаза 3 секунды.',
        startingWeight: 30
      },
      {
        id: 'standing_calf_raise',
        name: 'Standing Calf Raise',
        gif: 'assets/gifs/standing_calf_raise.png',
        muscles: ['Gastrocnemius'],
        muscleKeys: ['muscle.calves'],
        sets: 4, repsMin: 12, repsMax: 15, rest: 60, rpe: '7–8',
        equipment: 'Calf raise machine or Smith machine',
        note: 'Stance: shoulder-width, toes forward (neutral)',
        cuesEn: 'Full stretch at bottom — heel as low as possible. Full plantarflexion at top. Hold 1–2 sec at top contraction. NEVER bounce. Slow controlled tempo mandatory.',
        cuesRu: 'Полное растяжение внизу — пятка как можно ниже. Полное подошвенное сгибание вверху. Удержание 1–2 секунды в верхней точке. НИКОГДА не отбивайте. Медленный контролируемый темп обязателен.',
        startingWeight: 60
      },
      {
        id: 'cable_crunch',
        name: 'Cable Crunch (Kneeling)',
        gif: 'assets/gifs/cable_crunch.png',
        muscles: ['Rectus Abdominis', 'Obliques'],
        muscleKeys: ['muscle.core'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 60, rpe: '7',
        equipment: 'Cable machine + rope attachment',
        handle: 'Rope',
        pulley: 'Highest position (overhead)',
        grip: 'Hold rope at temples',
        cuesEn: 'Kneel facing stack. FLEX THE SPINE — round upper back toward knees. Do NOT hinge at hips. Elbows drive toward knees. Full extension at top before next rep.',
        cuesRu: 'Встаньте на колени лицом к стойке. СГИБАЙТЕ ПОЗВОНОЧНИК — скругляйте верхнюю часть спины к коленям. НЕ наклоняйтесь в тазобедренном суставе. Локти тянутся к коленям. Полное разгибание вверху перед следующим повторением.',
        startingWeight: 30
      }
    ]
  },

  'Push B': {
    type: 'Push B',
    dayKey: 'day.thursday',
    muscles: ['muscle.chest', 'muscle.shoulders', 'muscle.triceps'],
    theme: 'Hypertrophy',
    warmup: false,
    exercises: [
      {
        id: 'incline_db_press',
        name: 'Incline Dumbbell Press (30°)',
        gif: 'assets/gifs/incline_db_press.png',
        muscles: ['Upper Pectorals', 'Front Delts', 'Triceps'],
        muscleKeys: ['muscle.upper.chest', 'muscle.front.delts', 'muscle.triceps'],
        sets: 4, repsMin: 8, repsMax: 12, rest: 120, rpe: '8',
        equipment: 'Dumbbells + incline bench',
        grip: 'Neutral at bottom, semi-pronated at top',
        cuesEn: 'Bench at STRICTLY 30°. Let dumbbells drop wide and deep at bottom — stretched position under load is the primary hypertrophic stimulus. Press in arc converging overhead. 2-sec controlled descent. Deeper stretch than barbell version.',
        cuesRu: 'Скамья СТРОГО 30°. Опускайте гантели широко и глубоко внизу — растяжённое положение под нагрузкой является основным стимулом для роста. Жим по дуговой траектории, сходящейся над головой. Контролируемый опуск 2 секунды. Глубже растяжение, чем в варианте со штангой.',
        startingWeight: 24
      },
      {
        id: 'cable_chest_fly',
        name: 'Cable Chest Fly (Low Pulley Crossover)',
        gif: 'assets/gifs/cable_chest_fly.png',
        muscles: ['Pectorals (Sternal + Clavicular)', 'Front Delts'],
        muscleKeys: ['muscle.chest', 'muscle.upper.chest', 'muscle.front.delts'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 90, rpe: '7–8',
        equipment: 'Cable crossover + two D-handles',
        handle: 'D-handle each side',
        pulley: 'Lowest position',
        grip: 'Neutral, elbows slightly bent and LOCKED throughout',
        cuesEn: 'Stand in middle, slight forward lean. Start arms wide (maximum stretch). Arc forward and slightly upward until hands meet or cross at chest. Squeeze pecs as hands meet. Never let weight stack touch between reps.',
        cuesRu: 'Стоять посередине, небольшой наклон вперёд. Начинайте с широко разведёнными руками (максимальное растяжение). Дуговое движение вперёд и чуть вверх до встречи рук у груди. Сожмите грудные, когда руки встретятся. Не позволяйте блинам касаться между повторениями.',
        startingWeight: 12
      },
      {
        id: 'arnold_press',
        name: 'Arnold Press (Dumbbell, Seated)',
        gif: 'assets/gifs/arnold_press.png',
        muscles: ['All Three Delt Heads', 'Triceps', 'Rotator Cuff'],
        muscleKeys: ['muscle.shoulders', 'muscle.front.delts', 'muscle.side.delts', 'muscle.triceps'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 90, rpe: '7–8',
        equipment: 'Dumbbells + adjustable bench',
        grip: 'Starts supinated (palms facing YOU), ends pronated at top',
        cuesEn: 'Start with dumbbells in front of face, palms facing YOU, elbows low like top of a curl. As you press overhead ROTATE so palms face AWAY at top. Reverse on way down. Do not rush the rotation. Recruits all three delt heads simultaneously.',
        cuesRu: 'Начните с гантелями перед лицом, ладони обращены К ВАМ, локти внизу как в верхней точке сгибания. При жиме вверх РАЗВОРАЧИВАЙТЕ так, чтобы ладони смотрели ОТ ВАС вверху. Обратное движение при опускании. Не торопите вращение. Задействует все три пучка дельт одновременно.',
        startingWeight: 16
      },
      {
        id: 'cable_lateral_raise_leaning',
        name: 'Cable Lateral Raise — Leaning',
        gif: 'assets/gifs/cable_lateral_raise_leaning.png',
        muscles: ['Medial Deltoid'],
        muscleKeys: ['muscle.side.delts'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Cable machine + D-handle',
        pulley: 'Lowest position',
        cuesEn: 'Stand SIDEWAYS to cable. Hold support with free hand. Lean slightly AWAY from stack — pre-stretches medial delt. Raise arm out to side, lead with elbow, stop just above shoulder. Better strength curve than standing version.',
        cuesRu: 'Стоять БОКОМ к тросу. Держитесь свободной рукой за опору. Наклонитесь немного В СТОРОНУ ОТ стойки — это предварительно растягивает средний пучок дельты. Поднимайте руку в сторону, ведите локтем, останавливайтесь чуть выше уровня плеча. Лучшая кривая усилий, чем в стоячем варианте.',
        note: 'Per side',
        startingWeight: 10
      },
      {
        id: 'weighted_dips_chest',
        name: 'Weighted Dips (Chest-Focused)',
        gif: 'assets/gifs/weighted_dips_chest.png',
        muscles: ['Lower/Outer Pectorals', 'Triceps', 'Front Delts'],
        muscleKeys: ['muscle.chest', 'muscle.triceps', 'muscle.front.delts'],
        sets: 3, repsMin: 8, repsMax: 12, rest: 90, rpe: '8',
        equipment: 'Parallel dip bars + dip belt',
        grip: 'Parallel bars, shoulder-width',
        cuesEn: 'Lean torso FORWARD 15–30° from vertical = chest dip (upright = tricep dip). Lower until upper arm parallel to floor. Push back without fully locking out. Add dip belt once bodyweight is easy. Substitute: close-grip flat bench if shoulder pain occurs.',
        cuesRu: 'Наклоните корпус ВПЕРЁД на 15–30° от вертикали = отжимания на грудь (вертикально = на трицепс). Опускайтесь до параллели плеча с полом. Жмите обратно без полного выпрямления локтей. Добавляйте отягощение через пояс, когда с собственным весом станет легко. Замена: жим узким хватом лёжа при болях в плечах.',
        startingWeight: 0
      },
      {
        id: 'skull_crusher',
        name: 'Skull Crusher (EZ-Bar, Lying)',
        gif: 'assets/gifs/skull_crusher.png',
        muscles: ['Triceps Long Head', 'Lateral Head'],
        muscleKeys: ['muscle.triceps'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 60, rpe: '7',
        equipment: 'EZ-bar + flat bench',
        grip: 'Inner angled grip on EZ-bar',
        cuesEn: 'Lie on flat bench, arms extended vertically. Lower bar toward forehead bending ONLY at elbows. Elbows stay vertical and pointed at ceiling — do NOT flare. Full lockout each rep. 2-sec descent. EZ-bar reduces wrist strain significantly.',
        cuesRu: 'Лечь на горизонтальную скамью, руки вертикально. Опускайте гриф ко лбу, сгибая ТОЛЬКО локти. Локти остаются вертикальными, смотрят в потолок — НЕ разводите. Полное разгибание на каждом повторении. Опуск 2 секунды. EZ-гриф значительно снижает нагрузку на запястья.',
        startingWeight: 25
      },
      {
        id: 'cable_face_pull_push_b',
        name: 'Cable Face Pull',
        gif: 'assets/gifs/cable_face_pull.png',
        muscles: ['Rear Delts', 'Rotator Cuff', 'Upper Traps'],
        muscleKeys: ['muscle.rear.delts', 'muscle.traps'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '6–7',
        equipment: 'Cable machine + rope attachment',
        handle: 'Rope attachment',
        pulley: 'Face height (eye level)',
        grip: 'Overhand, thumbs pointing behind you',
        cuesEn: 'Pull toward forehead, splitting rope apart. Elbows end above shoulder height pointed outward. Mandatory push day shoulder health exercise.',
        cuesRu: 'Тяните к лбу, разводя верёвку в стороны. Локти заканчивают выше плеч, направлены наружу. Обязательное упражнение для здоровья плеч в день жимов.',
        startingWeight: 20
      }
    ]
  },

  'Pull B': {
    type: 'Pull B',
    dayKey: 'day.friday',
    muscles: ['muscle.back', 'muscle.biceps', 'muscle.rear.delts'],
    theme: 'Hypertrophy',
    warmup: false,
    exercises: [
      {
        id: 'weighted_pullup_b',
        name: 'Weighted Pull-Up',
        gif: 'assets/gifs/weighted_pullup.png',
        muscles: ['Lats', 'Biceps', 'Lower Traps', 'Core'],
        muscleKeys: ['muscle.lats', 'muscle.biceps', 'muscle.traps', 'muscle.core'],
        sets: 4, repsMin: 8, repsMax: 10, rest: 120, rpe: '8',
        equipment: 'Pull-up bar + weight belt',
        grip: 'Shoulder-width underhand OR neutral',
        cuesEn: 'Slightly less weight than Pull A — focus on controlled tempo and feeling the lat stretch at bottom and squeeze at top. Full dead hang at bottom. 8–10 reps = hypertrophy bias. Together with Pull A this is the most powerful thing you can do for lat width and V-taper development.',
        cuesRu: 'Чуть меньше веса, чем в Тяге A — фокус на контролируемом темпе, ощущении растяжения широчайших внизу и сжатии вверху. Полный вис прямых рук внизу. 8–10 повторений = акцент на гипертрофию. Вместе с Тягой A — самое эффективное, что вы можете сделать для ширины спины и V-образного силуэта.',
        startingWeight: 0
      },
      {
        id: 'chest_supported_db_row',
        name: 'Chest-Supported Incline Dumbbell Row',
        gif: 'assets/gifs/chest_supported_db_row.png',
        muscles: ['Mid Traps', 'Rhomboids', 'Rear Delts', 'Lower Lats'],
        muscleKeys: ['muscle.traps', 'muscle.back', 'muscle.rear.delts', 'muscle.lats'],
        sets: 4, repsMin: 10, repsMax: 12, rest: 90, rpe: '8',
        equipment: 'Dumbbells + incline bench',
        grip: 'Neutral (palms facing each other)',
        cuesEn: 'Set bench 30–45°, lie FACE DOWN chest against pad. Dumbbells hang below in full stretch. Row elbows straight back, squeeze shoulder blades at top. Eliminates ALL lower back stress — every rep is pure upper back. Cannot be cheated.',
        cuesRu: 'Угол скамьи 30–45°, лечь ЛИЦОМ ВНИЗ, грудью на подушку. Гантели свисают вниз в полном растяжении. Тяните локти строго назад, сводите лопатки вверху. Полностью устраняет нагрузку на поясницу — каждое повторение это чистая верхняя спина. Невозможно схитрить.',
        startingWeight: 22
      },
      {
        id: 'seated_cable_row_wide',
        name: 'Seated Cable Row — Wide Overhand',
        gif: 'assets/gifs/seated_cable_row_wide.png',
        muscles: ['Upper Traps', 'Rhomboids', 'Rear Delts'],
        muscleKeys: ['muscle.traps', 'muscle.back', 'muscle.rear.delts'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 90, rpe: '7–8',
        equipment: 'Cable machine + long straight bar',
        handle: 'Long straight bar',
        pulley: 'Lowest position',
        grip: 'Overhand, just outside shoulder-width',
        cuesEn: 'Pull to lower sternum. Elbows flare OUT at 70–80° from torso. Targets upper back, rear delts, rhomboids. Different from Pull A neutral row — covers full horizontal pull spectrum.',
        cuesRu: 'Тяните к нижней части груди. Локти разведены НАРУЖУ на 70–80° от торса. Нагружает верхнюю спину, задние дельты, ромбовидные. Отличается от нейтральной тяги Тяги A — перекрывает весь спектр горизонтальных тяг.',
        startingWeight: 55
      },
      {
        id: 'cable_rear_delt_fly',
        name: 'Cable Rear Delt Fly (Bent-Over, Crossed)',
        gif: 'assets/gifs/cable_rear_delt_fly.png',
        muscles: ['Rear Deltoid', 'Infraspinatus', 'Teres Minor'],
        muscleKeys: ['muscle.rear.delts', 'muscle.back'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Cable crossover + two D-handles',
        handle: 'D-handles CROSSED (right holds left cable, left holds right cable)',
        pulley: 'Face height or just above',
        grip: 'Neutral, elbows slightly bent and fixed',
        cuesEn: 'Bend over at 90°. Arms sweep wide in arc. Pause at peak with arms fully spread. Crossed cables maintain constant tension — unlike dumbbell reverse flies which go slack.',
        cuesRu: 'Наклонитесь на 90°. Руки движутся по широкой дуге. Пауза в конечной точке с полностью разведёнными руками. Скрещённые тросы поддерживают постоянное натяжение — в отличие от гантелей, которые теряют нагрузку в верхней точке.',
        startingWeight: 8
      },
      {
        id: 'incline_db_curl',
        name: 'Incline Dumbbell Curl',
        gif: 'assets/gifs/incline_db_curl.png',
        muscles: ['Biceps Long Head (Peak)', 'Brachialis'],
        muscleKeys: ['muscle.biceps'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 90, rpe: '7–8',
        equipment: 'Dumbbells + incline bench',
        grip: 'Supinated throughout (palms facing forward)',
        cuesEn: 'Bench at 45–60°, sit back with arms hanging FREELY behind body. Arms start behind body plane — pre-stretches long head (builds bicep peak). Do NOT let shoulders roll forward. Curl to full contraction, lower slowly.',
        cuesRu: 'Скамья под углом 45–60°, сядьте, руки свободно свисают ПОЗАДИ тела. Руки начинают за плоскостью тела — предварительно растягивает длинную головку (формирует пик бицепса). НЕ давайте плечам уходить вперёд. Сгибайте до полного сокращения, медленный опуск.',
        startingWeight: 12
      },
      {
        id: 'cable_curl_single_arm',
        name: 'Cable Curl — Single Arm, Low Pulley',
        gif: 'assets/gifs/cable_curl_single_arm.png',
        muscles: ['Biceps', 'Brachialis'],
        muscleKeys: ['muscle.biceps'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 60, rpe: '7',
        equipment: 'Cable machine + D-handle',
        pulley: 'Lowest position',
        grip: 'Supinated throughout',
        cuesEn: 'Arm fully extended at start — cable maintains tension at full extension where dumbbells go slack. Curl to full contraction. Fixes strength imbalances between sides. Slow 3-sec negative.',
        cuesRu: 'Рука полностью выпрямлена в начале — трос сохраняет нагрузку в точке полного растяжения, где гантели её теряют. Сгибайте до полного сокращения. Устраняет дисбаланс силы между сторонами. Медленный негатив 3 секунды.',
        note: 'Per side',
        startingWeight: 10
      }
    ]
  },

  'Legs B': {
    type: 'Legs B',
    dayKey: 'day.saturday',
    muscles: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings', 'muscle.calves', 'muscle.core'],
    theme: 'Hypertrophy',
    warmup: true,
    exercises: [
      {
        id: 'bulgarian_split_squat',
        name: 'Bulgarian Split Squat (Dumbbell)',
        gif: 'assets/gifs/bulgarian_split_squat.png',
        muscles: ['Quads', 'Glutes', 'Hamstrings', 'Balance'],
        muscleKeys: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 120, rpe: '8',
        equipment: 'Dumbbells + flat bench',
        grip: 'Neutral, dumbbells at sides',
        cuesEn: 'Rear foot on bench LACES DOWN. Front foot forward enough that shin stays roughly vertical. Drop rear knee straight down. Front knee tracks over toes. Lean torso slightly forward = more glute activation. START LIGHTER THAN EXPECTED — this is harder than it looks.',
        cuesRu: 'Задняя нога на скамье ШНУРКАМИ ВНИЗ. Передняя нога достаточно далеко вперёд, чтобы голень оставалась примерно вертикальной. Опускайте заднее колено прямо вниз. Переднее колено идёт по линии носка. Лёгкий наклон корпуса вперёд = больше нагрузки на ягодицы. НАЧИНАЙТЕ С МЕНЬШЕГО ВЕСА, ЧЕМ ОЖИДАЕТЕ — сложнее, чем выглядит.',
        note: 'Per leg',
        startingWeight: 16
      },
      {
        id: 'hack_squat',
        name: 'Hack Squat (Machine)',
        gif: 'assets/gifs/hack_squat.png',
        muscles: ['Quads (VMO)', 'Glutes'],
        muscleKeys: ['muscle.quads', 'muscle.glutes'],
        sets: 4, repsMin: 10, repsMax: 12, rest: 120, rpe: '8',
        equipment: 'Hack squat machine',
        note: 'Foot position: LOW and NARROW on platform',
        cuesEn: 'Low narrow position maximizes VMO activation — the teardrop above knee that gives athletic leg look. Descend as deep as possible. Knees track over toes. Safer for lower back than barbell squat.',
        cuesRu: 'Низкая узкая позиция максимально нагружает ВМО (медиальная широкая) — слеза над коленом, которая создаёт атлетичный вид ног. Опускайтесь как можно глубже. Колени по линии носков. Безопаснее для поясницы, чем приседания со штангой.',
        startingWeight: 60
      },
      {
        id: 'db_hip_thrust',
        name: 'Hip Thrust (Dumbbell or Machine)',
        gif: 'assets/gifs/db_hip_thrust.png',
        muscles: ['Glutes (Maximus)', 'Hamstrings'],
        muscleKeys: ['muscle.glutes', 'muscle.hamstrings'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 90, rpe: '7–8',
        equipment: 'Dumbbell across hips or hip thrust machine',
        cuesEn: 'Same mechanics as Legs A barbell hip thrust. Higher reps = metabolic hypertrophy stimulus. Glutes respond well to both heavy low-rep AND lighter high-rep in same week.',
        cuesRu: 'Та же техника, что и в Ногах A с штангой. Больше повторений = метаболический стимул гипертрофии. Ягодицы хорошо реагируют как на тяжёлый низкоповторный, так и на более лёгкий высокоповторный режим в одну неделю.',
        startingWeight: 30
      },
      {
        id: 'back_extension',
        name: 'Back Extension / Hyperextension',
        gif: 'assets/gifs/back_extension.png',
        muscles: ['Hamstrings', 'Glutes', 'Spinal Erectors'],
        muscleKeys: ['muscle.hamstrings', 'muscle.glutes'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 90, rpe: '7',
        equipment: 'GHD or back extension bench + weight plate',
        cuesEn: 'Hips at pad EDGE, feet secured. Hold plate across chest once bodyweight is easy. Start in deep hip hinge. Extend until body is NEUTRAL — do NOT hyperextend. 3-sec descent. Feel hamstring stretch at bottom.',
        cuesRu: 'Бёдра у КРАЯ подушки, ноги зафиксированы. Держите блин на груди, когда с весом тела станет легко. Начинайте с глубокого наклона в тазобедренном суставе. Разгибайтесь до НЕЙТРАЛЬНОГО положения тела — НЕ переразгибайтесь. Опуск 3 секунды. Ощущайте растяжение бицепса бедра внизу.',
        startingWeight: 0
      },
      {
        id: 'leg_extension',
        name: 'Leg Extension (Machine)',
        gif: 'assets/gifs/leg_extension.png',
        muscles: ['Rectus Femoris', 'All Quad Heads'],
        muscleKeys: ['muscle.quads'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 60, rpe: '7',
        equipment: 'Leg extension machine',
        cuesEn: 'Pad just above ankle. Knee joint aligns with pivot. Full extension at top — hold 1 sec. Slow 3-sec eccentric. Toes slightly INWARD = outer quad (vastus lateralis) bias.',
        cuesRu: 'Валик чуть выше лодыжки. Коленный сустав на одной оси с осью тренажёра. Полное разгибание вверху — держите 1 секунду. Медленный эксцентрик 3 секунды. Носки слегка ВНУТРЬ = акцент на внешний квадрицепс (широкая латеральная).',
        startingWeight: 35
      },
      {
        id: 'seated_calf_raise',
        name: 'Seated Calf Raise (Machine)',
        gif: 'assets/gifs/seated_calf_raise.png',
        muscles: ['Soleus (Deep Calf)'],
        muscleKeys: ['muscle.calves'],
        sets: 4, repsMin: 15, repsMax: 20, rest: 60, rpe: '7–8',
        equipment: 'Seated calf raise machine',
        cuesEn: 'SEATED specifically — isolates soleus, only worked in seated position. Complements Legs A standing raises. Deep stretch at bottom, full contraction at top. 2-sec pause at BOTH ends. Higher reps, slow tempo.',
        cuesRu: 'ИМЕННО СИДЯ — изолирует камбаловидную мышцу, которая работает только в сидячем положении. Дополняет стоячие подъёмы из Ног A. Глубокое растяжение внизу, полное сокращение вверху. Пауза 2 секунды на ОБОИХ концах. Больше повторений, медленный темп.',
        startingWeight: 40
      },
      {
        id: 'ab_wheel_rollout',
        name: 'Ab Wheel Rollout',
        gif: 'assets/gifs/ab_wheel_rollout.png',
        muscles: ['Rectus Abdominis', 'Obliques', 'Hip Flexors', 'Lats'],
        muscleKeys: ['muscle.core', 'muscle.lats'],
        sets: 3, repsMin: 8, repsMax: 12, rest: 60, rpe: '8',
        equipment: 'Ab wheel + mat',
        cuesEn: 'Kneel on mat. Roll forward keeping hips in STRAIGHT LINE with torso. Do NOT let hips drop or lower back hyperextend — injury risk. Pause 1 sec at full extension. Pull back using ONLY abs. Start with partial range and build to full extension over weeks.',
        cuesRu: 'Встаньте на колени на коврик. Катите вперёд, сохраняя бёдра на ОДНОЙ ЛИНИИ с торсом. НЕ позволяйте бёдрам проваливаться или пояснице прогибаться — риск травмы. Пауза 1 секунда в крайней точке. Возвращайтесь, используя ТОЛЬКО пресс. Начинайте с частичной амплитудой и постепенно увеличивайте её до полной.',
        startingWeight: 0
      }
    ]
  },

  'Rest': {
    type: 'Rest',
    dayKey: 'day.sunday',
    muscles: [],
    theme: 'Recovery',
    warmup: false,
    exercises: []
  }
};

// Warmup circuit for Legs A and Legs B
TF.APT_WARMUP = [
  { id: 'w1', key: 'warmup.w1', duration: '60 sec/side' },
  { id: 'w2', key: 'warmup.w2', duration: '2×15' },
  { id: 'w3', key: 'warmup.w3', duration: '2×8/side' }
];

TF.program = {
  getSession(type) {
    return TF.PROGRAM[type] || null;
  },

  getTodaySession() {
    const day = new Date().getDay();
    const type = TF.DAY_SESSION_MAP[day];
    return { type, session: TF.PROGRAM[type] };
  },

  getSessionForDate(dateStr) {
    const d = TF.utils.localDate(dateStr);
    const day = d.getDay();
    const type = TF.DAY_SESSION_MAP[day];
    return { type, session: TF.PROGRAM[type] };
  },

  getAllSessions() {
    return ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Rest'];
  },

  getWeekSchedule() {
    return [
      { day: 1, dayKey: 'day.monday', type: 'Push A' },
      { day: 2, dayKey: 'day.tuesday', type: 'Pull A' },
      { day: 3, dayKey: 'day.wednesday', type: 'Legs A' },
      { day: 4, dayKey: 'day.thursday', type: 'Push B' },
      { day: 5, dayKey: 'day.friday', type: 'Pull B' },
      { day: 6, dayKey: 'day.saturday', type: 'Legs B' },
      { day: 0, dayKey: 'day.sunday', type: 'Rest' }
    ];
  }
};
