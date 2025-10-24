-- Seed data for exercises
INSERT INTO exercises (name, description, goal_types, experience_levels, muscle_groups, equipment_needed) VALUES
-- Back pain exercises
('Cat-Cow Stretch', 'Gentle spine mobilization exercise that improves flexibility and reduces tension', ARRAY['back_pain'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['spine', 'core'], ARRAY['none']),
('Bird Dog', 'Core stability exercise that strengthens back and improves balance', ARRAY['back_pain', 'functional_fitness'], ARRAY['beginner', 'intermediate'], ARRAY['core', 'lower_back', 'glutes'], ARRAY['none']),
('Dead Bug', 'Anti-extension core exercise for spinal stability', ARRAY['back_pain', 'functional_fitness'], ARRAY['beginner', 'intermediate'], ARRAY['core', 'lower_back'], ARRAY['none']),
('Glute Bridge', 'Hip extension exercise that activates glutes and stabilizes spine', ARRAY['back_pain', 'powerlifting', 'functional_fitness'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['glutes', 'hamstrings', 'lower_back'], ARRAY['none']),

-- Powerlifting exercises
('Barbell Squat', 'Fundamental lower body compound movement', ARRAY['powerlifting', 'functional_fitness'], ARRAY['intermediate', 'advanced'], ARRAY['quads', 'glutes', 'hamstrings', 'core'], ARRAY['barbell', 'rack']),
('Bench Press', 'Primary upper body pressing movement', ARRAY['powerlifting'], ARRAY['intermediate', 'advanced'], ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell', 'bench']),
('Deadlift', 'Full body pulling movement and posterior chain developer', ARRAY['powerlifting', 'functional_fitness'], ARRAY['intermediate', 'advanced'], ARRAY['back', 'glutes', 'hamstrings', 'core'], ARRAY['barbell']),

-- Running exercises
('High Knees', 'Dynamic warm-up that improves running form and hip flexor strength', ARRAY['run_faster'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['hip_flexors', 'quads', 'calves'], ARRAY['none']),
('Calf Raises', 'Strengthens calves for better push-off power', ARRAY['run_faster', 'jump_higher'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['calves'], ARRAY['none']),
('Single Leg Romanian Deadlift', 'Unilateral strength and balance for running stability', ARRAY['run_faster', 'functional_fitness'], ARRAY['intermediate', 'advanced'], ARRAY['hamstrings', 'glutes', 'core'], ARRAY['dumbbell']),

-- Jump training exercises
('Box Jump', 'Plyometric exercise for explosive power', ARRAY['jump_higher', 'functional_fitness'], ARRAY['intermediate', 'advanced'], ARRAY['quads', 'glutes', 'calves'], ARRAY['box']),
('Bulgarian Split Squat', 'Single leg strength builder for vertical jump', ARRAY['jump_higher', 'functional_fitness'], ARRAY['intermediate', 'advanced'], ARRAY['quads', 'glutes'], ARRAY['dumbbells', 'bench']),
('Jump Squat', 'Explosive lower body power development', ARRAY['jump_higher', 'functional_fitness'], ARRAY['beginner', 'intermediate', 'advanced'], ARRAY['quads', 'glutes', 'calves'], ARRAY['none']);

-- Seed data for quizzes
INSERT INTO quizzes (goal_type, question, options, correct_answer, explanation, difficulty) VALUES
-- Back pain quizzes
('back_pain', 'What is the primary cause of most lower back pain?',
 '{"A": "Weak abs", "B": "Poor core stability and movement patterns", "C": "Tight hamstrings", "D": "Weak back muscles"}',
 'B',
 'While all factors can contribute, poor core stability and faulty movement patterns are the primary causes of most non-specific lower back pain.',
 'easy'),

('back_pain', 'Which muscles are part of the "core" system?',
 '{"A": "Just the abs", "B": "Abs and obliques only", "C": "All muscles that stabilize the spine including deep abdominals, back muscles, pelvic floor, and diaphragm", "D": "Only the six-pack muscles"}',
 'C',
 'The core is a complex system of muscles working together to stabilize the spine, including deep muscles like the transverse abdominis, multifidus, pelvic floor, and diaphragm.',
 'medium'),

-- Powerlifting quizzes
('powerlifting', 'What does progressive overload mean?',
 '{"A": "Always lifting heavy", "B": "Gradually increasing stress on the body over time", "C": "Doing maximum reps every workout", "D": "Training until failure"}',
 'B',
 'Progressive overload is the gradual increase of stress placed on the body during training, which can be achieved through increased weight, reps, sets, or frequency.',
 'easy'),

('powerlifting', 'What is the Valsalva maneuver used for in heavy lifting?',
 '{"A": "To breathe faster", "B": "To increase intra-abdominal pressure and spinal stability", "C": "To make lifting easier", "D": "To show off"}',
 'B',
 'The Valsalva maneuver involves taking a deep breath and bracing the core, which increases intra-abdominal pressure and provides crucial spinal stability during heavy lifts.',
 'medium'),

-- Running quizzes
('run_faster', 'What is the ideal cadence (steps per minute) for most runners?',
 '{"A": "120-140", "B": "160-180", "C": "200-220", "D": "100-120"}',
 'B',
 'Research suggests an optimal cadence of 160-180 steps per minute for most runners, which reduces ground contact time and improves efficiency.',
 'medium'),

('run_faster', 'Which muscle group is most important for the push-off phase of running?',
 '{"A": "Quads", "B": "Hip flexors", "C": "Calves and glutes", "D": "Hamstrings only"}',
 'C',
 'The calves and glutes are crucial for the push-off phase, generating propulsive force. The glutes extend the hip while the calves plantarflex the ankle.',
 'easy'),

-- Jump training quizzes
('jump_higher', 'What type of muscle action is most important for jumping?',
 '{"A": "Concentric only", "B": "Eccentric only", "C": "Stretch-shortening cycle (eccentric + concentric)", "D": "Isometric"}',
 'C',
 'The stretch-shortening cycle, where muscles rapidly lengthen (eccentric) then shorten (concentric), stores and releases elastic energy for maximum power output in jumping.',
 'medium');

-- Seed data for education content
INSERT INTO education_content (goal_type, title, content, content_type, order_index) VALUES
-- Back pain education
('back_pain', 'Understanding Your Spine',
 'Your spine has three main curves: cervical (neck), thoracic (mid-back), and lumbar (lower back). The lumbar spine bears most of your body weight and is most susceptible to injury. Learning to maintain a neutral spine during movement is key to preventing pain.',
 'article', 1),

('back_pain', 'The Core Stability System',
 'Your core is not just your abs! It includes the transverse abdominis (deep ab muscle), multifidus (small back muscles), pelvic floor, and diaphragm. These muscles work together to create a stable "cylinder" that protects your spine during movement.',
 'article', 2),

-- Powerlifting education
('powerlifting', 'The Big Three Lifts',
 'Powerlifting centers on three compound movements: the squat, bench press, and deadlift. These movements work multiple muscle groups simultaneously and form the foundation of strength training.',
 'article', 1),

('powerlifting', 'Progressive Overload Principles',
 'To get stronger, you must progressively challenge your muscles. This can be done by increasing weight, reps, sets, or decreasing rest time. Track your workouts to ensure consistent progress.',
 'article', 2),

-- Running education
('run_faster', 'Running Mechanics 101',
 'Efficient running involves proper posture, arm swing, foot strike, and cadence. Focus on landing with your foot under your body, maintaining an upright posture, and keeping a quick cadence.',
 'article', 1),

('run_faster', 'Building Running Endurance',
 'Aerobic capacity is built through consistent easy runs at conversational pace. The 80/20 rule suggests 80% of your running should be easy, with only 20% at higher intensities.',
 'article', 2),

-- Jump training education
('jump_higher', 'The Science of Vertical Jump',
 'Vertical jump power comes from the triple extension: simultaneous extension of the ankles, knees, and hips. Training should focus on explosive strength in these areas.',
 'article', 1),

('jump_higher', 'Plyometric Training Basics',
 'Plyometrics train the stretch-shortening cycle, improving reactive strength. Start with lower-intensity jumps and progress to more advanced movements as you build strength.',
 'article', 2);
