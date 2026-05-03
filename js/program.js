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
        id: 'hdw_iso_lateral_incline_press',
        name: 'HDW Iso-Lateral Incline Press',
        gif: 'assets/gifs/hdw_iso_lateral_incline_press.png',
        muscles: ['Upper Pectorals', 'Front Delts', 'Triceps'],
        muscleKeys: ['muscle.upper.chest', 'muscle.front.delts', 'muscle.triceps'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 90, rpe: '8',
        equipment: 'HDW iso-lateral incline chest press machine',
        grip: 'Neutral (palms facing each other), handles at chest height',
        cuesEn: 'Set seat height so handles meet at upper chest level. Press each arm independently — this is the key advantage. Full stretch at bottom, feel the upper chest load at the deepest point. Do NOT lock out at top — keep tension on muscle throughout. Controlled 2-sec descent. If one arm feels weaker, that side gets extra focus each set. Weight shown is per side — load both sides equally.',
        cuesRu: 'Настройте высоту сиденья так, чтобы ручки встречались на уровне верхней части груди. Жимайте каждой рукой независимо — это ключевое преимущество тренажёра. Полное растяжение внизу, ощутите нагрузку на верхнюю грудь в самой глубокой точке. НЕ блокируйте руки вверху — сохраняйте напряжение в мышце на протяжении всего движения. Контролируемый опуск 2 секунды. Если одна рука слабее, уделяйте ей дополнительное внимание в каждом подходе. Вес указан на сторону — загружайте обе стороны одинаково.',
        startingWeight: 40
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
        id: 'rear_delt_machine_push_a',
        name: 'Rear Delt Machine',
        gif: 'assets/gifs/rear_delt_machine.png',
        muscles: ['Rear Deltoid', 'Infraspinatus', 'Teres Minor'],
        muscleKeys: ['muscle.rear.delts', 'muscle.back'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Pec fly / rear delt combo machine set to REAR DELT mode',
        grip: 'Neutral, arms extended forward grabbing rear delt handles (NOT the chest fly handles)',
        cuesEn: 'Adjust seat so handles are at exact shoulder height. Select REAR DELT mode on the machine (arms sweep backward, not inward). Sit tall with chest against pad. Sweep both arms backward in a wide arc, pause 1 sec at maximum rear position — squeeze rear delts. Do NOT shrug or involve traps. Return slowly, 2-sec eccentric. Light weight, full range of motion, full squeeze at peak.',
        cuesRu: 'Отрегулируйте сиденье так, чтобы ручки были точно на уровне плеч. Выберите режим ЗАДНИЕ ДЕЛЬТЫ на тренажёре (руки движутся назад, а не внутрь). Сидите прямо, грудь прижата к подушке. Разведите обе руки назад по широкой дуге, задержитесь 1 секунду в крайнем заднем положении — сожмите задние дельты. НЕ поднимайте плечи. Медленный возврат, эксцентрик 2 секунды. Лёгкий вес, полная амплитуда.',
        startingWeight: 12
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
        cuesEn: 'Sit tall, feet flat on platform. Lean SLIGHTLY forward at the start to get a full lat stretch — then pull. Elbows travel back at 45° from torso — tucked in, not flaring wide. Pull V-bar to your NAVEL, not your chest. Squeeze shoulder blades together at full contraction. Hold 1 sec at peak. Controlled 2-sec return — lean forward again slightly to reload the stretch before each rep. Do NOT use momentum or rock the torso.',
        cuesRu: 'Сидите прямо, стопы на платформе. В начале НЕМНОГО наклонитесь вперёд для полного растяжения широчайших — затем тяните. Локти движутся назад под углом 45° к торсу — прижатые, не развёрнутые широко. Тяните V-гриф к ПУПКУ, а не к груди. Сведите лопатки в точке полного сокращения. Задержите 1 секунду в пике. Контролируемый возврат 2 секунды — снова немного наклоняйтесь вперёд для перезагрузки растяжения перед каждым повторением. НЕ используйте инерцию и не раскачивайте торс.',
        startingWeight: 60
      },
      {
        id: 'rear_delt_machine_pull_a',
        name: 'Rear Delt Machine',
        gif: 'assets/gifs/rear_delt_machine.png',
        muscles: ['Rear Deltoid', 'Infraspinatus', 'Teres Minor'],
        muscleKeys: ['muscle.rear.delts', 'muscle.back'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Pec fly / rear delt combo machine set to REAR DELT mode',
        grip: 'Neutral, arms extended forward grabbing rear delt handles (NOT the chest fly handles)',
        cuesEn: 'Adjust seat so handles are at exact shoulder height. Select REAR DELT mode. Sit tall with chest against pad. Sweep both arms backward in a wide arc, pause 1 sec at maximum rear position — squeeze rear delts. Do NOT shrug or involve traps. Return slowly, 2-sec eccentric. Light weight, full range of motion.',
        cuesRu: 'Отрегулируйте сиденье так, чтобы ручки были точно на уровне плеч. Выберите режим ЗАДНИЕ ДЕЛЬТЫ. Сидите прямо, грудь прижата к подушке. Разведите обе руки назад по широкой дуге, задержитесь 1 секунду — сожмите задние дельты. НЕ поднимайте плечи. Медленный возврат, эксцентрик 2 секунды. Лёгкий вес, полная амплитуда.',
        startingWeight: 12
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
        cuesEn: 'Stand tall, elbows pinned at sides — they do NOT move forward or swing during the curl. Neutral grip throughout — palms face your body at all times, NO supination. Alternate arms each rep. Curl to just past 90° — forearm meets upper arm. Zero body swing — if you need to rock, the weight is too heavy. This builds the brachialis (thickness under the bicep) and brachioradialis (forearm). Slow 2-sec descent.',
        cuesRu: 'Стоять прямо, локти прижаты к бокам — они НЕ движутся вперёд и не раскачиваются во время сгибания. Нейтральный хват на протяжении всего движения — ладони всегда смотрят к телу, БЕЗ супинации. Чередуйте руки на каждом повторении. Сгибайте чуть дальше 90° — предплечье встречается с плечом. Никакого раскачивания тела — если вы качаетесь, вес слишком большой. Это развивает брахиалис (толщину под бицепсом) и плечелучевую мышцу (предплечье). Медленный опуск 2 секунды.',
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
        id: 'seated_leg_curl',
        name: 'Seated Leg Curl (Machine)',
        gif: 'assets/gifs/seated_leg_curl.png',
        muscles: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
        muscleKeys: ['muscle.hamstrings'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 120, rpe: '7–8',
        equipment: 'Seated leg curl machine',
        grip: 'Hands hold side grips, back straight against pad',
        cuesEn: 'Sit tall, back fully against the pad. Hip is flexed at ~90° — this is what makes seated superior to lying. The pre-stretched hamstring position creates a longer range of activation. Let legs extend FULLY at the start of each rep — that stretched position is where growth stimulus is strongest. Curl until just past 90°. Slow 3-sec eccentric on the way back up. Do NOT let the weight slam at the top.',
        cuesRu: 'Сидите прямо, спина полностью прижата к подушке. Тазобедренный сустав согнут примерно на 90° — именно это делает сидячий вариант лучше лежачего. Предварительно растянутое положение бицепса бедра создаёт более длинный диапазон активации. Полностью выпрямляйте ноги в начале каждого повторения — растянутое положение даёт наибольший стимул для роста. Сгибайте до угла чуть более 90°. Медленная эксцентрическая фаза 3 секунды на пути обратно. НЕ бросайте вес в верхней точке.',
        startingWeight: 35
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
        id: 'pallof_press',
        name: 'Pallof Press',
        gif: 'assets/gifs/pallof_press.png',
        muscles: ['Transverse Abdominis', 'Obliques', 'Glutes'],
        muscleKeys: ['muscle.core'],
        sets: 3, repsMin: 12, repsMax: 12, rest: 60, rpe: '7',
        equipment: 'Cable machine + D-handle',
        handle: 'D-handle',
        pulley: 'Mid height (belly button level)',
        grip: 'Both hands clasped on handle, perpendicular to cable',
        note: 'Per side',
        cuesEn: 'Stand sideways to the cable stack, feet shoulder-width. Hold the handle with both hands at chest height. Press straight OUT in front of you until arms are fully extended — resist the rotational pull of the cable. Hold 1–2 sec at full extension. Pull back to chest. NEVER let the cable rotate your torso — this is anti-rotation core work. Keep hips squared forward, core braced 360°. No leaning away from the stack. Complete all reps on one side, then switch.',
        cuesRu: 'Встаньте боком к тросовой стойке, ноги на ширине плеч. Держите ручку обеими руками на уровне груди. Нажмите ПРЯМО перед собой, пока руки не выпрямятся — сопротивляйтесь вращательному усилию троса. Задержитесь 1–2 секунды в выпрямленном положении. Верните к груди. НИКОГДА не позволяйте тросу вращать ваш торс — это антиротационная тренировка кора. Бёдра смотрят строго вперёд, кор зафиксирован на 360°. Без наклона от стойки. Выполните все повторения на одну сторону, затем смените.',
        startingWeight: 10
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
        _alternating: [
          {
            id: 'cable_chest_fly',
            name: 'Cable Chest Fly (Low Pulley Crossover)',
            altTag: 'Alt A',
            gif: 'assets/gifs/cable_chest_fly.png',
            muscles: ['Pectorals (Sternal + Clavicular)', 'Front Delts'],
            muscleKeys: ['muscle.chest', 'muscle.upper.chest', 'muscle.front.delts'],
            equipment: 'Cable crossover + two D-handles',
            handle: 'D-handle each side',
            pulley: 'Lowest position',
            grip: 'Neutral, elbows slightly bent and LOCKED throughout',
            cuesEn: 'Stand in middle, slight forward lean. Start arms wide (maximum stretch). Arc forward and slightly upward until hands meet or cross at chest. Squeeze pecs as hands meet. Never let weight stack touch between reps.',
            cuesRu: 'Стоять посередине, небольшой наклон вперёд. Начинайте с широко разведёнными руками (максимальное растяжение). Дуговое движение вперёд и чуть вверх до встречи рук у груди. Сожмите грудные, когда руки встретятся. Не позволяйте блинам касаться между повторениями.',
            startingWeight: 12
          },
          {
            id: 'hdw_iso_lateral_horizontal_press',
            name: 'HDW Iso-Lateral Horizontal Press',
            altTag: 'Alt B',
            gif: 'assets/gifs/hdw_iso_lateral_horizontal_press.png',
            muscles: ['Pectorals (Sternal, Lower)', 'Front Delts'],
            muscleKeys: ['muscle.chest', 'muscle.front.delts'],
            equipment: 'HDW iso-lateral horizontal chest press machine',
            grip: 'Neutral (palms facing each other)',
            cuesEn: 'Seat height so handles align with mid-chest. Press each arm independently through full range. Full stretch at the bottom — let the chest open completely. Do NOT lock out at top, keep continuous tension. Targets the lower and outer chest differently from the incline angle. 2-sec controlled descent every rep. Weight shown is per side.',
            cuesRu: 'Высота сиденья так, чтобы ручки были на уровне середины груди. Жимайте каждой рукой независимо через полную амплитуду. Полное растяжение внизу — дайте груди полностью раскрыться. НЕ блокируйте руки вверху, сохраняйте постоянное напряжение. Нагружает нижнюю и внешнюю часть груди иначе, чем наклонный вариант. Контролируемый опуск 2 секунды на каждом повторении. Вес указан на сторону.',
            startingWeight: 40
          }
        ],
        sets: 3, repsMin: 12, repsMax: 15, rest: 90, rpe: '7–8'
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
        id: 'rear_delt_machine_push_b',
        name: 'Rear Delt Machine',
        gif: 'assets/gifs/rear_delt_machine.png',
        muscles: ['Rear Deltoid', 'Infraspinatus', 'Teres Minor'],
        muscleKeys: ['muscle.rear.delts', 'muscle.back'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Pec fly / rear delt combo machine set to REAR DELT mode',
        grip: 'Neutral, arms extended forward grabbing rear delt handles (NOT the chest fly handles)',
        cuesEn: 'Adjust seat so handles are at exact shoulder height. Select REAR DELT mode. Sit tall with chest against pad. Sweep both arms backward in a wide arc, pause 1 sec at maximum rear position — squeeze rear delts. Do NOT shrug or involve traps. Return slowly, 2-sec eccentric. Light weight, full range of motion.',
        cuesRu: 'Отрегулируйте сиденье так, чтобы ручки были точно на уровне плеч. Выберите режим ЗАДНИЕ ДЕЛЬТЫ. Сидите прямо, грудь прижата к подушке. Разведите обе руки назад по широкой дуге, задержитесь 1 секунду — сожмите задние дельты. НЕ поднимайте плечи. Медленный возврат, эксцентрик 2 секунды. Лёгкий вес, полная амплитуда.',
        startingWeight: 12
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
        cuesEn: 'Set incline bench to 30–35°. Lie FACE DOWN with chest fully against the pad — do not lift chest off at any point. Dumbbells hang straight down in a dead stretch at the start. Row elbows OUT and BACK at 60–70° from your torso — NOT tucked close to your sides (that works lats, not upper back). Pull toward your lower chest / upper abdomen. Squeeze shoulder blades together hard at the top, hold 1 sec. Lower slowly through full stretch — feel the mid-back and rhomboids stretch at the bottom. Cannot be cheated — pure upper back work.',
        cuesRu: 'Установите угол скамьи 30–35°. Лягте ЛИЦОМ ВНИЗ, грудь полностью прижата к подушке — не отрывайте грудь ни в какой момент. Гантели свисают вертикально вниз в полном растяжении. Тяните локти НАРУЖУ и НАЗАД под углом 60–70° от торса — НЕ прижимайте к бокам (это нагрузит широчайшие, а не верхнюю спину). Тяните к нижней части груди / верху живота. Сильно сведите лопатки в верхней точке, задержите 1 секунду. Медленно опускайте через полное растяжение — ощутите растяжение середины спины и ромбовидных внизу. Невозможно схитрить — чистая работа верхней спины.',
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
        id: 'pec_fly_rear_delt_machine',
        name: 'Rear Delt Machine (Pec Fly / Rear Delt)',
        gif: 'assets/gifs/rear_delt_machine.png',
        muscles: ['Rear Deltoid', 'Infraspinatus', 'Teres Minor'],
        muscleKeys: ['muscle.rear.delts', 'muscle.back'],
        sets: 3, repsMin: 15, repsMax: 20, rest: 60, rpe: '7',
        equipment: 'Pec fly / rear delt combo machine set to REAR DELT mode',
        grip: 'Neutral, arms extended forward grabbing rear delt handles (NOT the chest fly handles)',
        cuesEn: 'Adjust seat so handles are at exact shoulder height. Select REAR DELT mode on the machine (arms sweep backward, not inward). Sit tall with chest against pad. Sweep both arms backward in a wide arc, pause 1 sec at maximum rear position — squeeze rear delts. Do NOT shrug or involve traps. Return slowly, 2-sec eccentric. Light weight, full range of motion, full squeeze at peak. This is isolation work — do NOT go heavy.',
        cuesRu: 'Отрегулируйте сиденье так, чтобы ручки были точно на уровне плеч. Выберите режим ЗАДНИЕ ДЕЛЬТЫ на тренажёре (руки движутся назад, а не внутрь). Сидите прямо, грудь прижата к подушке. Разведите обе руки назад по широкой дуге, задержитесь 1 секунду в крайнем заднем положении — сожмите задние дельты. НЕ поднимайте плечи и не включайте трапеции. Медленный возврат, эксцентрик 2 секунды. Лёгкий вес, полная амплитуда, полное сжатие в пике. Это изоляция — НЕ берите большой вес.',
        startingWeight: 12
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
        cuesEn: 'Stand facing the cable stack, D-handle in one hand, pulley at lowest position. Elbow pinned at your side — it does NOT move forward, backward, or swing. Only your forearm moves. Supinated grip throughout (palm faces UP/forward). Arm FULLY extended at the start — cable maintains constant tension even at the bottom, unlike dumbbells. Curl to full contraction, squeeze at top. Slow 2-sec descent to full extension. Zero body sway — if you rock, reduce the weight. Directly fixes left/right strength imbalances.',
        cuesRu: 'Стоять лицом к тросовой стойке, D-ручка в одной руке, блок в нижнем положении. Локоть прижат к боку — он НЕ движется вперёд, назад и не раскачивается. Двигается только предплечье. Супинированный хват на протяжении всего движения (ладонь смотрит ВВЕРХ/вперёд). Рука ПОЛНОСТЬЮ выпрямлена в начале — трос сохраняет постоянное натяжение даже внизу, в отличие от гантелей. Сгибайте до полного сокращения, сжимайте вверху. Медленный опуск 2 секунды до полного разгибания. Никакого раскачивания тела — если качаетесь, уменьшите вес. Напрямую устраняет дисбаланс силы между левой и правой сторонами.',
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
        id: 'db_reverse_lunge',
        name: 'Dumbbell Reverse Lunge',
        gif: 'assets/gifs/db_reverse_lunge.png',
        muscles: ['Quads', 'Glutes', 'Hamstrings'],
        muscleKeys: ['muscle.quads', 'muscle.glutes', 'muscle.hamstrings'],
        sets: 3, repsMin: 10, repsMax: 12, rest: 120, rpe: '8',
        equipment: 'Dumbbells',
        grip: 'Neutral, dumbbells hanging at sides',
        cuesEn: 'Stand tall, feet hip-width. Step ONE foot directly backward — about 60–80cm. Lower the rear knee toward the floor, stopping just before contact. Front shin stays VERTICAL — front knee does NOT shoot past toes. Weight stays on front heel. Drive back up through front heel to return to standing. Both legs do all reps before switching, OR alternate — choose the same pattern every session. Torso stays upright throughout — do NOT lean forward. More stable than Bulgarian split squat because both feet stay on the floor. Weight shown is per dumbbell.',
        cuesRu: 'Стоять прямо, ноги на ширине бёдер. Шагните ОДНОЙ ногой строго назад — примерно на 60–80 см. Опустите заднее колено к полу, остановившись чуть выше контакта. Голень передней ноги остаётся ВЕРТИКАЛЬНОЙ — переднее колено НЕ выходит за носок. Вес на пятке передней ноги. Поднимайтесь через пятку передней ноги в исходное положение. Выполните все повторения одной ногой, затем смените — или чередуйте, выбирайте один и тот же паттерн каждую тренировку. Корпус прямой на протяжении всего движения — НЕ наклоняйтесь вперёд. Устойчивее болгарского выпада, так как обе ноги остаются на полу. Вес указан на каждую гантель.',
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
        cuesEn: 'Feet LOW and NARROW on the platform — shoulder-width or slightly narrower, positioned low on the plate. This foot position maximizes VMO (teardrop quad) activation. Back flat against the pad throughout — do NOT round. Chest up. Descend as deep as possible — aim for thighs parallel or below. Knees track directly over toes — do NOT let them cave inward. Drive through FULL foot on the way up. Do NOT lock out knees at the top. 2-sec controlled descent. Safer for lower back than barbell squat — use it.',
        cuesRu: 'Ноги НИЗКО и УЗКО на платформе — на ширине плеч или чуть уже, расположены низко на пластине. Такое положение ног максимально нагружает ВМО (медиальная широкая, «слеза»). Спина плоско прижата к подушке на протяжении всего движения — НЕ округляйте. Грудь вверх. Опускайтесь как можно глубже — стремитесь к параллели бёдер или ниже. Колени идут строго по линии носков — НЕ позволяйте им заваливаться внутрь. Жмите через ВСЮ стопу на подъёме. НЕ блокируйте колени вверху. Контролируемый опуск 2 секунды. Безопаснее для поясницы, чем приседания со штангой — используйте это.',
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
        cuesEn: 'Same setup as Legs A hip thrust machine. Upper back (mid-scapula, NOT neck or shoulders) contacts the pad. Feet flat, hip-width, toes slightly out. This session: HIGHER REPS at slightly lighter weight than Legs A. Drive hips up explosively, squeeze glutes HARD at the top — hold 1 sec at full extension. Hips fully level at the top — do not tilt one side. Lower with control — 2-sec descent. Do NOT let hips crash down between reps. The glutes respond well to both heavy low-rep (Legs A) and metabolic higher-rep (this session) in the same week.',
        cuesRu: 'Та же настройка, что и в тренажёре для тяги бёдер в Ногах A. Верхняя часть спины (середина лопатки, НЕ шея или плечи) касается подушки. Стопы плоско, на ширине бёдер, носки слегка наружу. Эта тренировка: БОЛЬШЕ ПОВТОРЕНИЙ с чуть меньшим весом, чем в Ногах A. Взрывной подъём бёдер, сильно сожмите ягодицы вверху — задержитесь 1 секунду в полном разгибании. Бёдра полностью ровные вверху — не кренитесь на одну сторону. Опускайте контролируемо — опуск 2 секунды. НЕ бросайте бёдра вниз между повторениями. Ягодицы хорошо реагируют как на тяжёлый низкоповторный режим (Ноги A), так и на метаболический высокоповторный (эта тренировка) в рамках одной недели.',
        startingWeight: 30
      },
      {
        id: 'lying_hip_extension',
        name: 'Lying Hip Extension',
        gif: 'assets/gifs/lying_hip_extension.gif',
        muscles: ['Glutes', 'Hamstrings', 'Spinal Erectors'],
        muscleKeys: ['muscle.glutes', 'muscle.hamstrings'],
        sets: 3, repsMin: 12, repsMax: 15, rest: 90, rpe: '6–7',
        equipment: 'Mat',
        grip: 'Hands folded under forehead, face down',
        cuesEn: 'Lie face down on a mat, hands under your forehead, forehead resting on hands. Legs straight. Lift ONE leg approximately 20cm off the floor — keep the leg straight, do NOT bend the knee. Squeeze the glute hard at the top. Hold 2 seconds at peak. Lower slowly — 2-sec descent. Do NOT hyperextend the lower back — the lift is small and controlled. Zero spinal compression — pure posterior chain activation. Alternate legs each rep or complete all reps on one side then switch.',
        cuesRu: 'Лягте лицом вниз на коврик, руки сложены под лбом, лоб опирается на руки. Ноги прямые. Поднимите ОДНУ ногу примерно на 20 см от пола — держите ногу прямой, НЕ сгибайте колено. Сильно сожмите ягодицу в верхней точке. Задержитесь 2 секунды на пике. Опускайте медленно — опуск 2 секунды. НЕ прогибайте поясницу — подъём небольшой и контролируемый. Нулевая нагрузка на позвоночник — чистая активация задней цепи. Чередуйте ноги в каждом повторении или выполните все повторения на одну сторону, затем смените.',
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
        id: 'dead_bug',
        name: 'Dead Bug',
        gif: 'assets/gifs/dead_bug.gif',
        muscles: ['Rectus Abdominis', 'Transverse Abdominis', 'Hip Flexors'],
        muscleKeys: ['muscle.core'],
        sets: 3, repsMin: 8, repsMax: 8, rest: 60, rpe: '6',
        equipment: 'Mat',
        cuesEn: 'Lie on your back, arms extended straight toward ceiling, knees bent at 90° directly above hips — like a dead bug on its back. Press your lower back FLAT into the mat — this is the most important cue. Maintain this flat back throughout the entire set. Simultaneously lower your RIGHT arm toward the floor behind your head AND extend your LEFT leg straight toward the floor. Stop just before either touches the floor. Return to start. Then switch — LEFT arm + RIGHT leg. That is one full rep per side. Move SLOWLY — 3 seconds down, 3 seconds back. If your lower back lifts off the mat, reduce range of motion. Zero momentum. This directly corrects anterior pelvic tilt.',
        cuesRu: 'Лягте на спину, руки вытянуты прямо к потолку, колени согнуты под 90° прямо над бёдрами — как мёртвый жук на спине. Прижмите поясницу ПЛОТНО к коврику — это самая важная подсказка. Сохраняйте это положение на протяжении всего подхода. Одновременно опустите ПРАВУЮ руку к полу за головой И вытяните ЛЕВУЮ ногу прямо к полу. Остановитесь, не касаясь пола. Вернитесь в исходное положение. Затем смените — ЛЕВАЯ рука + ПРАВАЯ нога. Это одно полное повторение на каждую сторону. Двигайтесь МЕДЛЕННО — 3 секунды вниз, 3 секунды обратно. Если поясница отрывается от коврика, уменьшите амплитуду. Нулевая инерция. Непосредственно исправляет передний наклон таза.',
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
    const session = TF.PROGRAM[type];
    if (!session) return null;

    // Resolve alternating exercises based on completed session count
    const hasAlternating = session.exercises.some(ex => ex._alternating);
    if (!hasAlternating) return session;

    const completedCount = (TF.data ? TF.data.getWorkoutSessions() : [])
      .filter(s => s.sessionType === type && s.completed).length;

    return {
      ...session,
      exercises: session.exercises.map(ex => {
        if (!ex._alternating) return ex;
        const idx = completedCount % ex._alternating.length;
        const chosen = ex._alternating[idx];
        return {
          ...chosen,
          sets: ex.sets, repsMin: ex.repsMin, repsMax: ex.repsMax,
          rest: ex.rest, rpe: ex.rpe
        };
      })
    };
  },

  getTodaySession() {
    return this.getSessionForDate(TF.utils.todayStr());
  },

  getSessionForDate(dateStr) {
    const d = TF.utils.localDate(dateStr);
    const rawDay = d.getDay();
    const offset = TF.data ? (TF.data.getScheduleOffset() || 0) : 0;
    if (offset === 0) {
      const type = TF.DAY_SESSION_MAP[rawDay];
      return { type, session: TF.PROGRAM[type] };
    }
    // PPL cycle in day-of-week order (Mon–Sun)
    const cycle = ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B', 'Rest'];
    const dayToCycle = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
    const basePos = dayToCycle[rawDay];
    const shiftedPos = ((basePos - offset) % 7 + 7) % 7;
    const type = cycle[shiftedPos];
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
