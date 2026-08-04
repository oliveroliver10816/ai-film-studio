/* THE ARRANGEMENT — CHAPTER ONE: "THE SIGNATURE"
   12 shots x 10.0 s = 120.0 s.

   The prompt text IS the deliverable, so it lives here rather than inside index.html.
   Every prompt is assembled from the constants below at render time, which means every
   block a person copies is self-contained and needs no other context.

   ⚠ Dialogue, music and sound effects are declared ONCE per shot, in the `lines`, `music`
   and `sfx` fields, and the video prompt's Audio block is BUILT from them by AUDIO(this).
   Never hand-write an audio or dialogue line into a prompt body — if the page and the
   prompt are allowed to hold two copies of the same line, they will eventually disagree. */

/* ---------------------------------------------------------------- CAST ---- */

/* Elena, v2. The mole is REMOVED from this spec on purpose: it drifted between the
   Flow generations (below the eye in one view, beside the mouth in another) and a mark
   that moves between shots is exactly what an audience notices without knowing why. */
const ELENA = "a 32-year-old woman, 5 feet 8 inches, slim and long-limbed with a long neck and straight square shoulders; oval face tapering to a narrow sharp chin; high flat wide-set cheekbones; a clean defined jawline; fair skin with a cool undertone, fine visible pore texture, a scatter of very faint freckles across the bridge of the nose, no blemishes and no heavy makeup; almond-shaped grey-green eyes with slightly hooded upper lids and dark natural lashes, no eyeliner; straight dark auburn eyebrows with a slight arch at the tail; a narrow straight nose bridge with a small refined tip; medium-full lips with a sharply defined cupid's bow; a very faint vertical crease between the brows; dark auburn hair with a centre parting pulled back smooth into a low chignon at the nape, matte not glossy, no loose strands";

const ADRIAN = "a 38-year-old man, 6 feet 1 inch, broad-shouldered and heavy through the chest but not overweight; square face with a wide jaw and a strong chin with a shallow cleft; olive skin with a warm undertone, visible pore texture, fine sun lines at the outer corners of the eyes; deep-set dark brown eyes under a heavy pronounced brow ridge; thick straight black eyebrows with a faint pale vertical scar about one centimetre long crossing the outer third of the RIGHT eyebrow, starting just above the brow line and cutting down through the hair of the brow; a straight slightly broad nose with a small bump at the bridge; a thin upper lip and a fuller lower lip; black hair swept straight back off the forehead, cut short at the sides, grey at both temples; three-day close-cropped stubble with grey coming through at the chin";

const ELENA_FIT = "a deep oxblood silk blouse buttoned to the throat under a sharply tailored matte black trouser suit worn open, no scarf, no pattern, no logo; no jewellery except a plain narrow gold wedding band on the left hand; matte deep oxblood-red lipstick; this is the only outfit she wears in the entire film";

const ADRIAN_FIT = "a navy three-piece wool suit with the waistcoat buttoned, a white cotton dress shirt with the collar open one button, no tie, no pocket square, no watch, a plain gold wedding band on the left hand; this is the only suit he wears in the entire film";

/* ----------------------------------------------------------------- SET ---- */

const SET = "a private dining room on the fortieth floor of an office tower at night; one long black lacquered table seating fourteen runs the full length of the room; the chairs are dark green leather; the long wall is floor-to-ceiling rain-streaked glass with the out-of-focus city far below; the floor is dark green marble; three small brass pendant lamps hang low over the centre of the table; the room is otherwise completely empty";

const LIGHT = "lit by practicals only — the three small brass pendants directly over the table give hard warm tungsten top light at 3200 Kelvin, throwing deep shadow into the eye sockets and under the jaw; a cold 5600 Kelvin spill comes off the rain-glass from the city outside and edges everything on the window side in blue; shadow ratio 8:1 with no fill whatsoever on the shadow side; no other light source is visible or implied";

const GRADE = "shot on Kodak Vision3 500T pushed one stop, fine visible film grain, heavy halation blooming around the practical lamps; the grade is desaturated with cyan-green shadows and neutral highlights, and the only saturated colours anywhere in frame are the oxblood of her blouse and the brass of the lamps; deep true blacks, no lifted shadows, no teal-and-orange look, no colour cast on skin; composed with clean headroom so the frame can be cropped to 2.39:1 later — do NOT render black letterbox bars";

const NEG = "no text, no signage, no captions, no subtitles, no readable writing or numbers anywhere in frame, no watermark, no logo, no border, no extra people, no crowd, no plants, no artwork, no visible modern electronics, no phone, no laptop, no lens flare";

/* --------------------------------------------------------- VIDEO BLOCKS ---- */

/* Identity, camera and text lock — repeated verbatim in every video prompt. Seedance has
   no memory between clips, so anything that must hold across the film has to be restated
   every single time. This is why the prompts are long, and it is not padding. */
const LOCK = "Keep every face, hairstyle, item of clothing and every part of the room exactly as they appear in the input image, unchanged for the whole clip. Do not add, remove or duplicate any person. Do not change the lighting setup, the colour grade or the lens. No readable text of any kind may appear anywhere in frame at any point: no caption, no subtitle, no watermark, no signage and no legible writing, letters or numbers on any surface.";

const REFBLOCK = (who, img) =>
`@Image 1 is the first frame of this shot. It defines the framing, the set, the wardrobe, the lighting and the colour grade. Continue directly from it.
@Image 2 defines ${who}'s facial features, bone structure, hairline and skin only. Do not use @Image 2's background, clothing, lighting, pose or composition. (${img})`;

const FIRSTFRAME_BOTH =
`@Image 1 is the first frame of this shot. It defines the framing, the set, both characters, their wardrobe, the lighting and the colour grade. Continue directly from it.`;

/* THE single source of truth for every audible thing in a shot. */
function AUDIO(s){
  let a = `Audio: (${s.music}) ` + s.sfx.map(x => `<${x}>`).join(' ');
  for (const l of s.lines) a += `\n${l.speaker} ${l.say}: {${l.text}}`;
  return a;
}

/* ------------------------------------------------------------- THE FILM ---- */

const SHOTS = [

/* ------------------------------------------------------------------ S01 -- */
{
  id: "S01", title: "ARRIVAL", t: "0:00 – 0:10", silent: true,
  framing: "Wide · 40mm · locked · she is a reflection, not a face",
  refs: ["elena_rear.png"],
  why: "The film opens on a reflection rather than a face, because the whole story is that he is not looking at the person he thinks he is. The camera does not move at all. The rain does every piece of motion in the shot, which also means nothing in the frame has to survive scrutiny in the first ten seconds — the cheapest possible opening, and the strongest.",
  lines: [],
  beats: [
    ["0–4 s", "Rain runs down the glass. Her reflection is already there, still."],
    ["4–8 s", "Her reflected eyes move once, from the city up to her own reflection."],
    ["8–10 s", "She is completely still again. End state: unchanged framing."]
  ],
  music: "a single sustained low cello note, no melody and no percussion, sitting under the rain for the whole ten seconds",
  sfx: ["heavy rain running down a large glass window, close and continuous", "the hush of distant traffic forty floors below, very faint"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a wide locked-off shot from inside a dark room looking at a floor-to-ceiling rain-streaked glass wall at night. A woman stands close to the glass with her back to camera, occupying the left third of the frame as a dark silhouette. Her face is visible only as a sharp reflection in the glass, looking out over the city.

THE WOMAN: ${ELENA}.

WARDROBE: ${ELENA_FIT}.

SET: ${SET}. In this shot the table runs away from camera into darkness on the right of frame and is barely lit.

LIGHT: ${LIGHT}. In this shot her face is lit almost entirely by the cold blue spill off the glass; the warm pendants are far behind her and read only as two small brass blooms in the deep background.

LENS: 40mm anamorphic at T2.8. Focus is on the reflected face in the plane of the glass. The city forty floors below is thrown to soft round bokeh. Camera at chest height, level, no tilt.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. Her real face must not be visible — only the reflection.`; },

  video: function(){ return `${REFBLOCK("the woman", "elena_rear.png — face only")}

Dialogue language: British English throughout. There is no dialogue in this shot and no mouth moves at any point.

A woman stands motionless at a floor-to-ceiling rain-streaked glass wall at night, her back to camera, her face visible only as a reflection in the glass.

0-4 seconds: Rain runs down the outside of the glass in continuous vertical streaks. She is completely still. Her reflection holds steady in the glass.
4-8 seconds: Her reflected eyes move once, slowly, from the city below up to meet her own reflection. Nothing else in the frame moves.
8-10 seconds: She is completely still again. End state: identical framing to the first frame, she has not moved her feet, head or shoulders at any point.

The visuals feature hard warm tungsten pendants deep in the background, a cold blue spill off the rain-glass, an 8:1 shadow ratio with no fill, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single wide locked-off camera on a 40mm anamorphic lens at T2.8, at chest height and level, focused on the reflected face in the plane of the glass. The camera does not move, pan, tilt, push or shake at any point. There are no cuts.

${LOCK}

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S02 -- */
{
  id: "S02", title: "THE LENGTH OF THE TABLE", t: "0:10 – 0:20",
  framing: "Wide · 40mm · locked · both in frame, and the geometry says everything",
  refs: ["elena_rear.png", "adrian_full.png"],
  why: "The only wide in the film with both of them in it. He is small, centred and lit; she is large, near and dark. The power in this shot is done entirely by where the camera stands, not by either performance — which is the point, because staging is the part of filmmaking a generator cannot take away from you.",
  lines: [
    { who: "ADRIAN", text: "You're late.",
      speaker: "The man, ADRIAN, says",
      say: "in a low, level, unhurried British accent, stating a fact rather than making a complaint",
      how: "Low, level, unhurried. Not a complaint — a time-stamp. He does not look up until the end of the line." },
    { who: "ELENA", text: "I was reading.",
      speaker: "The woman, ELENA, answers",
      say: "flatly in a British accent, without apology and without turning her head",
      how: "Flat, two words, no apology, without breaking her stride." }
  ],
  beats: [
    ["0–3 s", "Empty table. Adrian seated at the far head, small in frame."],
    ["3–6 s", "Elena enters near the camera and starts down the table. ADRIAN's line."],
    ["6–10 s", "ELENA's line as she walks. End state: she is halfway down the table."]
  ],
  music: "the sustained low cello note continues from the previous shot, and a second note a fifth below enters underneath it at around six seconds",
  sfx: ["a woman's heels on marble, slow and evenly spaced, receding from the camera", "rain on glass, muffled by the window"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a wide locked-off shot down the full length of a long black lacquered dining table, camera low at table height at the near end. A man sits alone at the far head of the table, small in the frame and centred, lit from directly above. A woman stands in the near foreground on the left, large, dark and mostly in silhouette, seen from behind at three-quarters as she begins to walk away from camera down the table.

THE MAN: ${ADRIAN}.
THE WOMAN: ${ELENA}.

WARDROBE — MAN: ${ADRIAN_FIT}.
WARDROBE — WOMAN: ${ELENA_FIT}.

SET: ${SET}.

LIGHT: ${LIGHT}. In this shot the three pendants light the man and the centre of the table; the near foreground where the woman stands is almost unlit and reads as a dark mass.

LENS: 40mm anamorphic at T2.8, camera at table height, level, deep focus held on the man at the far end while the near foreground silhouette falls slightly soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. No food, no plates, no glasses and no place settings anywhere on the table — the table is completely bare.`; },

  video: function(){ return `${FIRSTFRAME_BOTH}

Dialogue language: British English throughout. Two characters speak in this shot, in this order, and they must not be swapped.

A woman walks the length of a long bare black table towards a man seated alone at the far head of it, in a dark empty dining room at night.

0-3 seconds: The room is still. The man sits at the far head of the table looking down at the table surface. The woman stands in the near foreground with her back to camera, not yet moving.
3-6 seconds: She begins walking away from camera down the length of the table, unhurried, her heels sounding on the marble. The man lifts his head towards her only at the end of his line. ADRIAN speaks.
6-10 seconds: She continues walking without breaking stride and answers without turning her head. ELENA speaks. End state: she is roughly halfway down the table with her back still to camera, and the man is still seated with both hands on the table.

The visuals feature hard warm tungsten top light from three low pendants over the centre of the table, a cold blue spill off the rain-glass on the left, an 8:1 shadow ratio with no fill, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single wide locked-off camera on a 40mm anamorphic lens at T2.8, at table height and level, deep focus held on the man at the far end. The camera does not move, pan, tilt, push or shake at any point. There are no cuts.

${LOCK}

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S03 -- */
{
  id: "S03", title: "THE FOLDER", t: "0:20 – 0:30",
  framing: "Insert · 100mm · high angle · no faces, and no readable paper",
  refs: [],
  why: "A hands-and-object insert, deliberately placed third. It buys a cut away from faces before we have asked the model to hold either face for very long, and it introduces the contract without ever showing a word of it. The folder stays shut. That rule holds for every shot in this film that involves paper.",
  lines: [
    { who: "ADRIAN (off)", text: "It's the last of it. Sign it, and the name comes off the building tomorrow.",
      speaker: "Off-screen, the man, ADRIAN, says",
      say: "quietly in a low British accent, almost gently, as though he believes he is being kind, with a small pause after the first sentence",
      how: "Quiet and almost gentle. He believes he is doing her a kindness. Small pause after 'the last of it'." }
  ],
  beats: [
    ["0–4 s", "Empty lacquer. A black folder slides in from the right and stops."],
    ["4–8 s", "A brass fountain pen is laid on top of it. ADRIAN's line runs across both."],
    ["8–10 s", "Hands withdraw out of frame. End state: folder and pen alone, closed."]
  ],
  music: "no music in this shot — the sustained cello from the previous shot fades out over the first two seconds and does not return",
  sfx: ["leather sliding across polished lacquer, a long low friction sound", "a metal pen set down on leather, one small click", "rain on glass, distant and muffled"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic. Insert shot, no faces in frame.

FRAMING: a high-angle insert looking down at the surface of a long black lacquered table. A man's hands enter from the right of frame, sliding a closed black leather document folder across the polished surface towards the left. A slim brass fountain pen rests on top of the folder. The folder is CLOSED. Only the hands are visible — no face, no head, no shoulders.

THE HANDS: the hands of ${ADRIAN}, with visible skin texture, short clean nails and a plain gold wedding band on the left hand. Shirt cuff and navy suit sleeve visible at the wrist.

WARDROBE: ${ADRIAN_FIT} — only the cuff and sleeve are in frame.

SET: ${SET}. Only the table surface, the folder, the pen and the reflected pendant lights are in frame; the room behind falls to black.

LIGHT: ${LIGHT}. In this shot the three pendants are directly above the frame, so the folder and the hands are hard top-lit with deep shadow underneath, and the pendants reflect as three long streaks in the lacquer.

LENS: 100mm anamorphic macro at T2.8, high angle looking down at about sixty degrees, focus on the brass pen, the far end of the folder falling soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. The folder must be closed and completely blank — no title, no label, no embossing, no visible paper edge and no writing of any kind.`; },

  video: function(){ return `@Image 1 is the first frame of this shot. It defines the framing, the table, the folder, the pen, the hands, the lighting and the colour grade. Continue directly from it.

Dialogue language: British English throughout. The speaker is out of frame — this is off-screen dialogue over an insert shot, with no mouth visible.

A man's hands slide a closed black leather folder with a brass fountain pen on it across a polished black table, then withdraw.

0-4 seconds: The hands push the closed folder slowly across the lacquer from right to left and stop it in the centre of frame. The movement is unhurried and even.
4-8 seconds: One hand lifts the brass fountain pen a few centimetres and sets it back down squarely on top of the folder. ADRIAN speaks off-screen across this whole range.
8-10 seconds: Both hands withdraw out of the right of frame. End state: the closed folder and the pen sit alone in the centre of the table, the folder still shut, nothing else in frame.

The visuals feature hard warm tungsten top light with the three pendant lamps reflecting as long streaks in the black lacquer, deep shadow under the folder, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off 100mm anamorphic macro insert at T2.8 from a high angle of about sixty degrees, focused on the brass pen. The camera does not move, pan, tilt, push or shake at any point. There are no cuts. No face, head or shoulders enter the frame at any time.

${LOCK} The folder must stay closed for the entire clip and must remain completely blank — no title, no label, no embossing, no paper edge and no writing of any kind.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S04 -- */
{
  id: "S04", title: "THE FUNERAL", t: "0:30 – 0:40",
  framing: "Close-up · 75mm · locked · eye level · she never looks at the folder",
  refs: ["elena_front.png"],
  why: "The first time we see her face properly, thirty seconds in. She does not look at the folder and she does not gesture — movement is head and eyes only, for the whole film. This frame is duplicated exactly at shot ten, so that the only thing which has changed between them is what the audience knows.",
  lines: [
    { who: "ELENA", text: "Everyone at the funeral told me to let it go.",
      speaker: "The woman, ELENA, says",
      say: "in a flat, level, unsentimental British accent — a fact she has repeated too many times to feel any more, not a sad line",
      how: "Flat. Not sad. A statement of fact she has repeated too many times to feel it any more." }
  ],
  beats: [
    ["0–3 s", "She holds still, eyes off-camera to the left, not on the folder."],
    ["3–8 s", "ELENA's line, delivered without moving her head."],
    ["8–10 s", "One slow blink. Eyes come back to level. End state: unchanged."]
  ],
  music: "one single low piano note struck under the line and left to decay, with no chord and nothing after it",
  sfx: ["rain on glass, distant", "the faint electrical hum of a low tungsten lamp"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a close-up of a woman's head and shoulders, centred, at exact eye level, against the near-black depth of a dark room. She is lit from directly above by a single warm pendant. Her eyes are directed slightly off-camera to the left. Neutral expression, mouth closed, chin level.

THE WOMAN: ${ELENA}.

WARDROBE: ${ELENA_FIT} — the oxblood collar and the black jacket shoulder are in the bottom of frame.

SET: ${SET}. Almost nothing of the room is legible behind her — only one small brass pendant far back on the left as a soft warm bloom, and a faint cold blue vertical edge of the rain-glass on the right of frame.

LIGHT: ${LIGHT}. In this shot the pendant directly overhead is the key, so the brow throws shadow into the eye sockets, there is a shadow under the nose and jaw, and there is no fill at all under the chin.

LENS: 75mm anamorphic at T2.0, camera at exact eye level and square to her, focus critically on the near eye, background thrown completely soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. No hands in frame, no folder, no pen, no table.`; },

  video: function(){ return `${REFBLOCK("the woman", "elena_front.png — face only")}

Dialogue language: British English throughout.

A woman in close-up speaks one line without moving her head, in a dark room lit from directly above.

0-3 seconds: She holds completely still, her eyes directed slightly off-camera to the left, mouth closed, chin level. Nothing in the frame moves.
3-8 seconds: She speaks one line. Her head does not move and her shoulders do not move; only her mouth and her eyes move. ELENA speaks.
8-10 seconds: One slow blink after the line lands, then her eyes come back to level. End state: identical framing and identical head position to the first frame.

The visuals feature a single hard warm tungsten pendant directly overhead as the only key, deep shadow in the eye sockets and under the jaw, no fill at all, a soft warm bloom deep in the background on the left, a cold blue vertical edge of rain-glass on the right, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off close-up on a 75mm anamorphic lens at T2.0, at exact eye level and square to the subject, focused critically on the near eye with the background completely soft. The camera does not move, pan, tilt, push or shake at any point. There are no cuts.

${LOCK} She must not gesture, raise a hand, nod, tilt her head or turn her shoulders at any point.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S05 -- */
{
  id: "S05", title: "IN THE CAR", t: "0:40 – 0:50",
  framing: "Close-up · 75mm · locked · reverse of S04, matched height",
  refs: ["adrian_front.png"],
  why: "A clean reverse, cut on the same lens and the same height as her close-up so the two faces sit in the same world. He almost smiles and it dies before it finishes. He is the only warm-coloured thing in the frame, which is the film quietly telling you he is comfortable and she is not.",
  lines: [
    { who: "ADRIAN", text: "Your father would have signed it in the car.",
      speaker: "The man, ADRIAN, says",
      say: "in a low British accent, almost warmly, as though paying a compliment to a dead man",
      how: "Almost warm. He thinks this is a compliment to the dead man. The smile starts and does not complete." }
  ],
  beats: [
    ["0–3 s", "He is looking directly at her, still, one hand on the table edge."],
    ["3–8 s", "ADRIAN's line. A small smile begins and stops halfway."],
    ["8–10 s", "He leans back a few centimetres. End state: same framing, chin lowered."]
  ],
  music: "the low piano note from the previous shot resolves down by one semitone and decays into nothing",
  sfx: ["a soft shift of wool suiting as he leans back", "one quiet creak of leather from the chair", "rain on glass, distant"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a close-up of a man's head and shoulders, centred, at exact eye level, against the near-black depth of a dark room. He is lit from directly above by a single warm pendant, and he is looking directly into the lens. Neutral expression, mouth closed.

THE MAN: ${ADRIAN}.

WARDROBE: ${ADRIAN_FIT} — the open white collar and the navy waistcoat and jacket shoulder are in the bottom of frame.

SET: ${SET}. Almost nothing of the room is legible behind him — one small brass pendant far back on the right as a soft warm bloom, and near-total blackness elsewhere.

LIGHT: ${LIGHT}. In this shot the pendant directly overhead is the key, so the heavy brow ridge throws deep shadow into the eye sockets, and the shadow under the jaw is solid black with no fill. The pale scar through the outer third of his right eyebrow must be visible.

LENS: 75mm anamorphic at T2.0, camera at exact eye level and square to him, matched exactly to the woman's close-up, focus critically on the near eye, background thrown completely soft.

GRADE: ${GRADE}. He is the only warm-toned element in the frame.

EXCLUSIONS: ${NEG}. No hands in frame, no folder, no pen.`; },

  video: function(){ return `${REFBLOCK("the man", "adrian_front.png — face only")}

Dialogue language: British English throughout.

A man in close-up speaks one line directly to camera, in a dark room lit from directly above.

0-3 seconds: He is looking directly into the lens, completely still, mouth closed. Nothing in the frame moves.
3-8 seconds: He speaks one line. A small smile begins at one corner of his mouth and stops halfway, never completing. ADRIAN speaks.
8-10 seconds: He leans back a few centimetres and lowers his chin slightly. End state: same framing, head still centred, chin very slightly lower than at the start.

The visuals feature a single hard warm tungsten pendant directly overhead as the only key, deep shadow inside the eye sockets under a heavy brow ridge, solid black shadow under the jaw with no fill, a soft warm bloom deep in the background on the right, heavy film grain and halation, and a desaturated cyan-shadowed grade in which he is the only warm-toned element.

Use a single locked-off close-up on a 75mm anamorphic lens at T2.0, at exact eye level and square to the subject, focused critically on the near eye with the background completely soft. The camera does not move, pan, tilt, push or shake at any point. There are no cuts.

${LOCK} The faint pale scar crossing the outer third of his right eyebrow must stay visible and unchanged for the whole clip.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S06 -- */
{
  id: "S06", title: "TAKING NOTES", t: "0:50 – 1:00",
  framing: "Two-shot · 40mm · profile · she is sharp, he is soft",
  refs: ["elena_profile.png", "adrian_profile.png"],
  why: "The one two-shot in the middle of the film, played in profile across the table so neither face has to hold a front-on close-up for ten seconds while both are moving. She turns pages without reading them, because she already knows what is in them — that single piece of behaviour is the entire plot, played without a word of exposition.",
  lines: [
    { who: "ELENA", text: "He taught me how to do this. He just never thought I was taking notes.",
      speaker: "The woman, ELENA, says",
      say: "in a level British accent with a trace of dryness, in two sentences with a small pause between them, not played as a joke",
      how: "The only line in the film with any dryness in it. Two sentences with a small pause between them. Do not play it as a joke." }
  ],
  beats: [
    ["0–3 s", "She opens the folder. Her eyes stay on him, not on the page."],
    ["3–7 s", "She turns pages, three of them, unhurried. ELENA's first sentence."],
    ["7–10 s", "Second sentence. End state: folder open, her hand flat on the page."]
  ],
  music: "the low cello returns, one whole tone higher than the opening note, entering at around six seconds",
  sfx: ["heavy paper turning, three separate pages, unhurried", "rain on glass, distant"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a two-shot from the side, camera at table height, looking across the long black table at both characters in near-profile facing each other. The woman is on the left of frame in the near plane and sharp; the man is on the right of frame, further from camera, and soft. Between them on the table is an open black leather folder, angled steeply away from the lens so no page face is readable.

THE WOMAN: ${ELENA}.
THE MAN: ${ADRIAN}.

WARDROBE — WOMAN: ${ELENA_FIT}.
WARDROBE — MAN: ${ADRIAN_FIT}.

SET: ${SET}. The rain-glass wall runs behind both of them across the back of frame.

LIGHT: ${LIGHT}. In this shot the pendants sit between the two of them so both are rimmed and top-lit, with the cold blue rain-glass behind separating them from the background.

LENS: 40mm anamorphic at T2.0, camera at table height, level, focus critically on the woman's near eye with the man falling clearly soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. The pages of the folder must not be readable — they are angled steeply away from the lens, and any paper in frame is blank, out of focus, or both.`; },

  video: function(){ return `${FIRSTFRAME_BOTH}

Dialogue language: British English throughout.

A woman opens a folder on a long black table and turns its pages without looking at them, while a man watches her from the far side of the table.

0-3 seconds: She opens the black leather folder in front of her. Her eyes stay on the man across the table the entire time and never drop to the page.
3-7 seconds: She turns three pages, one at a time, unhurried, still without looking down at them. She begins to speak. ELENA speaks her first sentence.
7-10 seconds: She finishes speaking after a small pause. The man does not react. End state: the folder is open, her hand rests flat on the open page, and her eyes are still on him.

The visuals feature the three pendant lamps between the two characters so both are top-lit and rimmed, the cold blue rain-glass wall running behind them, an 8:1 shadow ratio with no fill, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off side-on two-shot in near-profile on a 40mm anamorphic lens at T2.0, at table height and level, focused critically on the woman's near eye with the man clearly soft. The camera does not move, pan, tilt, push, rack focus or shake at any point. There are no cuts.

${LOCK} The pages must stay angled steeply away from the lens and must remain blank throughout — no printing, letters or numbers may become visible on any page.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S07 -- */
{
  id: "S07", title: "THE SIGNATURE", t: "1:00 – 1:10",
  framing: "Insert · 100mm macro · the nib is sharp and the hand is at the edge of frame",
  refs: [],
  why: "The film's false ending, and the most technically dangerous shot in it — fine hand-work over paper is one of the few things that still gives generated video away. So the hand enters at the bottom edge and stays mostly out of frame, the page sits at forty degrees to the lens, only the nib is in focus, and the movement is slow. The music stops dead on the last stroke; that silence is what makes the next shot work.",
  lines: [
    { who: "ADRIAN (off)", text: "Thank you, Elena.",
      speaker: "Off-screen, the man, ADRIAN, says",
      say: "very quietly and completely sincerely in a low British accent, three words only",
      how: "Very quiet, and completely sincere. Three words. He has no idea." }
  ],
  beats: [
    ["0–3 s", "Pen lifted into frame from below. Nib settles on the page."],
    ["3–7 s", "One slow continuous signing stroke. Music cuts out on the last of it."],
    ["7–10 s", "Pen laid down. ADRIAN's line off-screen into silence."]
  ],
  music: "no music under the signing — any remaining score stops completely at around six seconds and the last three seconds of this shot carry no music at all",
  sfx: ["the scratch of a steel nib dragging across heavy paper, slow and close", "a pen laid down on wood, one soft knock", "rain on glass, very distant"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic. Insert shot, no faces in frame.

FRAMING: an extreme close macro insert of the tip of a brass fountain pen resting on the corner of a sheet of heavy cream paper, the page lying at about forty degrees to the lens so that its surface skates away out of focus almost immediately. A woman's hand enters from the very bottom edge of frame holding the pen — only the first joints of two fingers and part of the thumb are in frame, everything else is cropped out by the bottom edge. A plain narrow gold wedding band is visible on one finger.

THE HAND: the hand of ${ELENA} — slim, fair, cool undertone, fine visible skin texture, short unpolished nails, a plain narrow gold wedding band.

SET: ${SET} — only the black lacquer, the paper and the pen are in frame; everything beyond falls to black.

LIGHT: ${LIGHT}. In this shot the pendant directly overhead makes a hard specular highlight run down the brass barrel of the pen, and the paper carries a deep raking shadow across its lower half.

LENS: 100mm anamorphic macro at T2.8, very shallow, focus critically on the nib alone; the paper is out of focus within two centimetres of the nib in both directions.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. Absolutely no readable writing, letters, numbers, signature, printing or ruled lines on the paper — the visible part of the page is blank and the rest is out of focus. No wrist, forearm, sleeve or face in frame.`; },

  video: function(){ return `@Image 1 is the first frame of this shot. It defines the framing, the pen, the paper, the hand position, the lighting and the colour grade. Continue directly from it.

Dialogue language: British English throughout. The speaker is out of frame — this is off-screen dialogue over a macro insert, with no mouth visible.

A woman's hand signs a document with a brass fountain pen, in extreme close-up.

0-3 seconds: The hand lifts the pen very slightly and settles the nib onto the paper. The movement is slow and controlled.
3-7 seconds: The nib draws one single slow continuous signing stroke across the page and lifts at the end of it. The camera stays locked and the hand never rises far enough to reveal the wrist or sleeve.
7-10 seconds: The pen is laid down flat beside the page and the hand withdraws out of the bottom of frame. ADRIAN speaks off-screen into the silence. End state: the pen lies still beside the paper and nothing is in frame but the pen, the page and the black lacquer.

The visuals feature a hard specular highlight running down the brass barrel from the pendant directly overhead, a deep raking shadow across the lower half of the page, extremely shallow depth of field, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off 100mm anamorphic macro insert at T2.8, focused critically on the nib alone. The camera does not move, pan, tilt, push, rack focus or shake at any point. There are no cuts. No wrist, forearm, sleeve, shoulder or face enters the frame at any time.

${LOCK} No readable writing, letters, numbers, signature, printing or ruled lines may appear on the paper at any point — the visible part of the page stays blank and the ink stroke must not resolve into legible characters.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S08 -- */
{
  id: "S08", title: "THE PAGE YOU DIDN'T READ", t: "1:10 – 1:20",
  framing: "Medium · 40mm · over his shoulder · she is small at the far end and owns the frame",
  refs: ["adrian_rear.png", "elena_34a.png"],
  why: "The turn, and it is staged rather than performed. She is small, far away and sharp; his shoulder is a huge dark unfocused mass in the near foreground. Three full seconds of silence run before she speaks — no music at all under this shot, because the score stopped in the previous one and has not come back. The quiet is doing the work.",
  lines: [
    { who: "ELENA", text: "There's a page you didn't read.",
      speaker: "The woman, ELENA, says",
      say: "quietly and evenly in a British accent, with no emphasis anywhere in the line and no satisfaction in it",
      how: "Quiet, even, no emphasis anywhere in the line. She is not enjoying this yet." }
  ],
  beats: [
    ["0–3 s", "Silence. She pushes one sheet of paper back down the table."],
    ["3–6 s", "The page slides. Nobody speaks. Let it run."],
    ["6–10 s", "ELENA's line. End state: the page has stopped in front of him."]
  ],
  music: "no music of any kind in this shot — the score is completely silent for the whole ten seconds",
  sfx: ["a single sheet of heavy paper sliding a long way across polished lacquer", "rain on glass, suddenly noticeable because nothing else is playing"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a medium shot from directly behind and just past a man's shoulder, so the near left third of the frame is filled by the dark out-of-focus mass of his shoulder and the back of his head. Beyond him, down the length of the long black table, a woman stands small in the centre of frame, sharp, one hand still extended flat on the table after pushing something. A single sheet of cream paper lies on the lacquer between them.

THE MAN (foreground, out of focus, seen from behind): ${ADRIAN}.
THE WOMAN (background, sharp): ${ELENA}.

WARDROBE — MAN: ${ADRIAN_FIT}.
WARDROBE — WOMAN: ${ELENA_FIT}.

SET: ${SET}.

LIGHT: ${LIGHT}. In this shot the pendants light the woman and the table between them; the man's shoulder in the near foreground is an almost black silhouette with only a thin cold blue rim from the window on his left edge.

LENS: 40mm anamorphic at T2.0, camera just behind and above the man's shoulder, focus held on the distant woman so the entire foreground shoulder is heavily soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. The sheet of paper on the table is blank, small in frame and not readable.`; },

  video: function(){ return `${FIRSTFRAME_BOTH}

Dialogue language: British English throughout.

A woman at the far end of a long black table pushes a single sheet of paper down its length towards a man seen from behind in the near foreground.

0-3 seconds: Complete silence apart from the rain. The woman, small and sharp at the far end of the table, pushes one sheet of paper away from herself along the lacquer. Neither of them speaks.
3-6 seconds: The sheet slides steadily down the table towards the camera and slows. Still nobody speaks. The man in the foreground does not move at all.
6-10 seconds: She speaks one quiet line. ELENA speaks. End state: the sheet of paper has come to rest on the table in front of the man, and she has lowered her hand.

The visuals feature the pendant lamps lighting the distant woman and the table between them, the man's foreground shoulder reduced to an almost black silhouette with a thin cold blue rim from the window, an 8:1 shadow ratio with no fill, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off medium shot on a 40mm anamorphic lens at T2.0, positioned just behind and above the man's shoulder, focused on the distant woman with the entire foreground shoulder heavily soft. The camera does not move, pan, tilt, push, rack focus or shake at any point. There are no cuts.

${LOCK} The sheet of paper must remain blank throughout.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S09 -- */
{
  id: "S09", title: "DATED IN MARCH", t: "1:20 – 1:30",
  framing: "Close-up · 75mm · the only camera move in the film, a very slow push",
  refs: ["adrian_front.png"],
  why: "He reads aloud, which is the trick that lets the audience learn what the page says without the camera ever having to render a legible word. One very slow push in — the single camera move in twelve shots, saved for the moment the story turns, so it is felt rather than noticed.",
  lines: [
    { who: "ADRIAN", text: "...transfer of the holding company, effective on the date of the marriage.",
      speaker: "The man, ADRIAN, reads aloud from the page",
      say: "in a level British accent, the way a person reads something they believe they have already agreed to",
      how: "Read aloud off the page, evenly, the way you read something you have already agreed to." },
    { who: "ADRIAN", text: "This is dated in March.",
      speaker: "Then, after a pause of about two seconds, much more quietly and to himself rather than to anyone else, ADRIAN says",
      say: "in a low British accent, half under his breath",
      how: "Much quieter. Not to her — to himself. The first crack." }
  ],
  beats: [
    ["0–4 s", "He picks up the page. Eyes track one line. First line read aloud."],
    ["4–7 s", "His eyes stop moving. Two seconds of nothing. The push begins."],
    ["7–10 s", "Second line, quieter. End state: tighter frame, eyes off the page."]
  ],
  music: "a low string cluster rises very slowly out of silence starting at around five seconds and is still rising when the clip ends",
  sfx: ["a held sheet of heavy paper with a small tremor running through it", "rain on glass, distant"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a close-up of a man's head and shoulders, slightly off centre to the right, at eye level. He holds a single sheet of cream paper up at the bottom edge of frame, angled steeply away from the lens so its face is not visible to camera; he is reading from it, eyes down.

THE MAN: ${ADRIAN}.

WARDROBE: ${ADRIAN_FIT}.

SET: ${SET}. Behind him the room falls to near black with one small brass pendant bloom high on the left and a cold blue edge of rain-glass on the far right.

LIGHT: ${LIGHT}. In this shot the pendant overhead keys him, and a faint cold bounce comes up off the pale paper into the underside of his jaw — the only fill anywhere in the film, and it should be barely perceptible.

LENS: 75mm anamorphic at T2.0, eye level, focus critically on the near eye, the held paper falling soft in the near foreground.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. The paper is angled so that no writing, printing, letters or numbers are visible on it at any point.`; },

  video: function(){ return `${REFBLOCK("the man", "adrian_front.png — face only")}

Dialogue language: British English throughout. The same character speaks twice in this shot, in this order.

A man in close-up reads a line aloud from a sheet of paper, then stops and speaks a second line to himself.

0-4 seconds: He lifts the sheet of paper slightly and reads from it, eyes tracking left to right along a single line. ADRIAN reads his first line aloud.
4-7 seconds: His eyes stop moving and stay fixed on one point on the page. He does not speak for two full seconds. The camera begins a very slow push in.
7-10 seconds: He speaks a second, much quieter line, and his eyes come off the page and go slightly out of focus past the camera. End state: the framing is slightly tighter than at the start, the paper is still held at the bottom of frame, and his eyes are no longer on it.

The visuals feature a hard warm tungsten pendant overhead as key, a barely perceptible cold bounce off the pale paper into the underside of his jaw, near-black background with one brass bloom high on the left, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a 75mm anamorphic close-up at T2.0 at eye level, focused critically on the near eye. The camera is locked for the first four seconds, then performs one very slow, smooth, continuous push in for the rest of the clip — no more than a ten percent change in frame size overall. There is no pan, no tilt, no shake and no cut at any point.

${LOCK} The sheet of paper must stay angled steeply away from the lens so that no writing, printing, letters or numbers ever become visible on it. The faint pale scar crossing the outer third of his right eyebrow must stay visible and unchanged.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S10 -- */
{
  id: "S10", title: "FEBRUARY", t: "1:30 – 1:40",
  framing: "Close-up · 75mm · locked · matched exactly to S04",
  refs: ["elena_front.png"],
  why: "Deliberately the identical frame to shot four — same lens, same height, same light, same distance. Nothing about the image has changed. The only thing that has changed is what the audience knows, and putting the two shots in the same frame is what makes that land. Five words, and no expression on them.",
  lines: [
    { who: "ELENA", text: "You married me in February.",
      speaker: "The woman, ELENA, says",
      say: "in an absolutely level British accent with no triumph, no anger and no emphasis on any word",
      how: "Absolutely level. No triumph, no anger, no emphasis on any word. Five words and then nothing." }
  ],
  beats: [
    ["0–4 s", "She is still. Eyes now directly on him, not off to the left."],
    ["4–8 s", "ELENA's line. Nothing else in her face moves."],
    ["8–10 s", "She holds. No blink. End state: unchanged framing."]
  ],
  music: "the low string cluster from the previous shot holds at the same pitch throughout and does not resolve",
  sfx: ["rain on glass, distant", "the faint electrical hum of a low tungsten lamp"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic. This frame must match shot four exactly in lens, height, distance and lighting — the only difference is where her eyes are directed.

FRAMING: a close-up of a woman's head and shoulders, centred, at exact eye level, against the near-black depth of a dark room, lit from directly above by a single warm pendant. Her eyes are directed straight ahead and slightly off-camera to the right this time. Neutral expression, mouth closed, chin level.

THE WOMAN: ${ELENA}.

WARDROBE: ${ELENA_FIT} — the oxblood collar and the black jacket shoulder are in the bottom of frame.

SET: ${SET}. Almost nothing of the room is legible behind her — one small brass pendant far back on the left as a soft warm bloom, and a faint cold blue vertical edge of the rain-glass on the right of frame.

LIGHT: ${LIGHT}. Identical to shot four: pendant directly overhead as key, shadow into the eye sockets, shadow under the nose and jaw, no fill at all under the chin.

LENS: 75mm anamorphic at T2.0, camera at exact eye level and square to her, focus critically on the near eye, background thrown completely soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. No hands in frame, no folder, no pen, no table.`; },

  video: function(){ return `${REFBLOCK("the woman", "elena_front.png — face only")}

Dialogue language: British English throughout.

A woman in close-up speaks one short line without moving, in a dark room lit from directly above.

0-4 seconds: She holds completely still, her eyes now directed straight ahead and only slightly off-camera to the right. Mouth closed, chin level. Nothing in the frame moves.
4-8 seconds: She speaks five words. Only her mouth moves — her head, her eyes, her eyebrows and her shoulders do not move at all. ELENA speaks.
8-10 seconds: She holds the same position without blinking after the line. End state: identical framing and identical head position to the first frame.

The visuals feature a single hard warm tungsten pendant directly overhead as the only key, deep shadow in the eye sockets and under the jaw, no fill at all, a soft warm bloom deep in the background on the left, a cold blue vertical edge of rain-glass on the right, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single locked-off close-up on a 75mm anamorphic lens at T2.0, at exact eye level and square to the subject, focused critically on the near eye with the background completely soft. The camera does not move, pan, tilt, push or shake at any point. There are no cuts.

${LOCK} She must not gesture, nod, tilt her head, raise an eyebrow or turn her shoulders at any point, and there must be no change of expression on the line.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S11 -- */
{
  id: "S11", title: "THE TURN", t: "1:40 – 1:50",
  framing: "Wide · 40mm · handheld — the only handheld shot in the film",
  refs: ["adrian_full.png", "elena_34a.png"],
  why: "Eleven locked-off shots and then this one breathes, which is the whole reason the previous eleven were nailed down. Two lines and a beat between them: his is a conclusion, hers is a correction. This is the payoff and it is the hardest test in the package — two characters, two lines, one take.",
  lines: [
    { who: "ADRIAN", text: "You married me to take it back.",
      speaker: "The man, ADRIAN, says",
      say: "quietly and with complete certainty in a low British accent, not asking and not shouting, with a slight downward inflection on the last word",
      how: "Quiet and certain. He is not asking and he is not shouting. Slight downward inflection on the last word." },
    { who: "ELENA", text: "I married you to take all of it.",
      speaker: "After a pause of about one and a half seconds, the woman, ELENA, answers",
      say: "almost in a whisper in a British accent, with no triumph in it, landing hard on the word all and letting the last two words fall away",
      how: "Almost a whisper. No triumph. Land hard on 'all', then let the last two words fall away." }
  ],
  beats: [
    ["0–3 s", "He stands. Chair scrapes back. Frame moves with him."],
    ["3–6 s", "ADRIAN's line across the table."],
    ["6–7 s", "A full beat. Neither of them moves."],
    ["7–10 s", "ELENA's line. End state: both standing, neither has moved position."]
  ],
  music: "a full low string swell rising underneath both lines and still rising when the clip ends",
  sfx: ["a heavy leather chair pushed back hard across marble", "rain on glass rising in level under the swell"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic.

FRAMING: a wide shot across the long black table with both characters in frame, the man on the right in the act of standing up from his chair at the head of the table, the woman on the left standing at the far side. The framing is very slightly off-level and slightly loose, as a handheld operator would hold it.

THE MAN: ${ADRIAN}.
THE WOMAN: ${ELENA}.

WARDROBE — MAN: ${ADRIAN_FIT}.
WARDROBE — WOMAN: ${ELENA_FIT}.

SET: ${SET}. The rain-glass runs the full width behind them and the city is far out of focus beyond it.

LIGHT: ${LIGHT}. In this shot he rises up through the hard pendant light so the top light rakes down his face, and she stays outside the pendant pool lit mainly by the cold blue window.

LENS: 40mm anamorphic at T2.8, camera at chest height, deep focus so both figures read, very slight handheld imperfection in the horizon.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. Both hands of both characters must be either at their sides or resting on the table — no pointing, no raised palms, no gesticulation.`; },

  video: function(){ return `${FIRSTFRAME_BOTH}

Dialogue language: British English throughout. Two different characters speak in this shot, in this order, and their lines must not be swapped or overlapped.

A man stands up from the head of a long black table and speaks to a woman standing at the far side of it, and she answers him.

0-3 seconds: The man pushes his chair back and stands, rising up through the hard pendant light. The camera drifts very slightly with him, as a handheld operator would follow a movement.
3-6 seconds: He speaks one line across the table. He does not move towards her and he does not gesture. ADRIAN speaks.
6-7 seconds: Neither of them moves and neither speaks for a full beat.
7-10 seconds: She answers, very quietly, without moving. ELENA speaks. End state: he is standing at the head of the table, she is standing at the far side, neither has changed position, and both pairs of hands are still at their sides or resting on the table.

The visuals feature hard warm pendant top light raking down the standing man's face, the woman lit mainly by cold blue window light outside the pendant pool, the rain-glass running the full width behind them, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a wide 40mm anamorphic shot at T2.8 at chest height with deep focus so both figures read. This is the only handheld shot in the film: the camera should carry a small, slow, natural handheld drift and a very slightly off-level horizon. It must not shake, whip, snap, zoom or cut at any point — the movement is a drift, not a shake.

${LOCK} Neither character may point, raise a palm, gesticulate or walk during this clip. There must be exactly two people in frame for the entire ten seconds.

${AUDIO(this)}`; }
},

/* ------------------------------------------------------------------ S12 -- */
{
  id: "S12", title: "THE EXIT", t: "1:50 – 2:00", silent: true,
  framing: "Wide · 40mm · locked · the exact reverse of S02",
  refs: ["elena_full.png", "adrian_full.png"],
  why: "The mirror of shot two, and the reason shot two was framed the way it was. There she was near, dark and walking away while he sat lit and centred; here she walks towards the lens, lit and sharp, while he is left small, standing and out of focus behind her. Same room, same lens, same height, opposite geometry — the story is told twice, once at the start and once at the end, and never spoken aloud either time.",
  lines: [],
  beats: [
    ["0–3 s", "She turns from the table and starts walking towards camera."],
    ["3–8 s", "She walks the length of the table. He does not move."],
    ["8–10 s", "She passes close to the lens and out of frame left. End: he is alone."]
  ],
  music: "the string swell resolves down to the single sustained low cello note that opened the film, and holds to the end",
  sfx: ["a woman's heels on marble, approaching the camera and then passing it", "rain on glass, returning to the level it had in the first shot"],

  image: function(){ return `Cinematic film still, 16:9, photorealistic, shot on 35mm anamorphic. This is the exact reverse of shot two: same room, same lens, same camera height, opposite direction.

FRAMING: a wide locked-off shot back down the full length of the long black lacquered table, camera low at table height at the far end. A woman walks towards camera down the length of the table, sharp and lit, occupying the centre of frame at mid distance. Behind her at the far head of the table a man stands alone, small and out of focus.

THE WOMAN: ${ELENA}.
THE MAN: ${ADRIAN}.

WARDROBE — WOMAN: ${ELENA_FIT}.
WARDROBE — MAN: ${ADRIAN_FIT}.

SET: ${SET}.

LIGHT: ${LIGHT}. In this shot she passes directly under each of the three pendants in turn so the top light strikes her as she comes; behind her the room is dim and the man stands mostly outside the light.

LENS: 40mm anamorphic at T2.0, camera at table height, level, focus held on the woman at mid distance so the standing man behind her is clearly soft.

GRADE: ${GRADE}.

EXCLUSIONS: ${NEG}. The table is completely bare — no folder, no pen and no paper anywhere on it.`; },

  video: function(){ return `${FIRSTFRAME_BOTH}

Dialogue language: British English throughout. There is no dialogue in this shot. Neither character speaks and neither character's mouth moves at any point.

A woman walks the length of a long black table towards the camera while a man stands motionless at the far end behind her.

0-3 seconds: She turns away from the table and begins walking towards the camera, unhurried. The man at the far head of the table stays completely still.
3-8 seconds: She walks the length of the table towards the lens, passing under each of the three pendant lamps in turn so the top light strikes her as she comes. She does not look back. The man does not move at all.
8-10 seconds: She passes close to the lens and exits frame left. End state: the man is left standing alone and out of focus at the far end of the empty table, and the frame is otherwise empty.

The visuals feature hard warm pendant top light striking her in three successive pools as she walks, a dim background with the standing man mostly outside the light, the cold blue rain-glass along the left wall, heavy film grain and halation, and a desaturated cyan-shadowed grade.

Use a single wide locked-off camera on a 40mm anamorphic lens at T2.0, at table height and level, focused on the woman at mid distance so the standing man behind her is clearly soft. The camera does not move, pan, tilt, push, rack focus or shake at any point. There are no cuts.

${LOCK} The table must stay completely bare.

${AUDIO(this)}`; }
}

];

/* ------------------------------------------------------------- SYNTAX ---- */

const SYNTAX = [
  ["Music", "( )", "(a full low string swell rising underneath both lines)"],
  ["Sound effects", "&lt; &gt;", "&lt;a heavy leather chair pushed back hard across marble&gt;"],
  ["Dialogue", "{ }", "{You married me to take it back.}"],
  ["Subtitles", "【 】", "【Chapter One】 — not used in this film"]
];

/* ==========================================================================
   STRUCTURED (JSON) PROMPT LAYER
   --------------------------------------------------------------------------
   Added 2026-08-04 after the voyzlab A/B (x.com/voyzlab/status/2084332023544455378):
   same model, same scene, plain-text vs JSON prompt — the claim is that a labelled
   field structure stops the model dropping small scene elements (a hand in mud), and
   that the fix is to give those elements their OWN field rather than burying them in
   a paragraph.

   We take the technique and extend it. That post carries five fields — scene, subject,
   action, camera, lighting — plus object_interaction. It has NO audio, NO dialogue, NO
   time structure, NO reference-image roles, NO continuity lock and NO exclusions, all of
   which we already know matter. The schema below is the superset.

   ⚠ Same discipline as the natural-language layer: this is BUILT from the existing
   fields, never hand-copied. The dialogue, music and SFX come from lines/music/sfx, so
   the two prompt formats cannot drift apart.
   ========================================================================== */

/* Per-shot structure that the prose fields do not already carry. */
const STRUCT = {
S01:{ set_state:"the room is dark and empty; the table runs away into darkness on the right and is barely lit; rain runs continuously down the outside of the glass",
  cam:{shot_size:"wide",lens:"40mm anamorphic",aperture:"T2.8",height:"chest height",angle:"level, no tilt",movement:"none — fully locked off",focus:"the reflected face in the plane of the glass",dof:"city forty floors below thrown to soft round bokeh",cuts:"none"},
  light_note:"her face is lit almost entirely by the cold blue spill off the glass; the warm pendants are far behind her and read only as two small brass blooms in the deep background",
  objects:[{object:"rain on the glass wall",interaction:"runs down the outside of the pane in continuous vertical streaks for the whole ten seconds",physics:"gravity-driven rivulets that merge and break; refraction distorts the city lights behind them",must_persist:true},
           {object:"her reflection in the glass",interaction:"holds steady and sharp in the pane; the eyes move once",physics:"a true mirror reflection, correct parallax against the glass surface, not a second person",must_persist:true}] },

S02:{ set_state:"the long black table is completely bare — no plates, no glasses, no place settings, no paper; fourteen dark green leather chairs; the man is seated at the far head",
  cam:{shot_size:"wide",lens:"40mm anamorphic",aperture:"T2.8",height:"table height, low",angle:"level, looking down the long axis of the table",movement:"none — fully locked off",focus:"deep focus held on the man at the far end",dof:"the near foreground silhouette falls slightly soft",cuts:"none"},
  light_note:"the three pendants light the man and the centre of the table; the near foreground where the woman stands is almost unlit and reads as a dark mass",
  objects:[{object:"her heels on the marble floor",interaction:"she walks away from camera down the length of the table at an even, unhurried pace",physics:"weight transfers heel to toe; the sound is evenly spaced and recedes with her",must_persist:true},
           {object:"the man's hands",interaction:"both rest flat on the table surface and stay there for the whole clip",physics:"stationary contact with the lacquer, no drumming, no gesture",must_persist:true}] },

S03:{ set_state:"only the table surface, the closed folder, the pen and the three reflected pendant streaks are in frame; the room behind falls to black",
  cam:{shot_size:"insert / macro",lens:"100mm anamorphic macro",aperture:"T2.8",height:"above the table",angle:"high angle looking down at about sixty degrees",movement:"none — fully locked off",focus:"the brass pen",dof:"the far end of the folder falls soft",cuts:"none"},
  light_note:"the three pendants sit directly above the frame, so the folder and hands are hard top-lit with deep shadow underneath and the lamps reflect as three long streaks in the lacquer",
  objects:[{object:"black leather document folder",interaction:"pushed by the man's hands from the right of frame to the centre, then released; it stays CLOSED for the entire clip",physics:"leather sliding on polished lacquer — slight initial resistance, then a smooth glide that decelerates and stops; the folder does not tip, open or bounce",must_persist:true},
           {object:"brass fountain pen",interaction:"lifted a few centimetres off the folder by one hand and set back down squarely on top of it",physics:"rigid metal object, one small contact click, it does not roll after being set down",must_persist:true},
           {object:"the man's hands",interaction:"enter from the right of frame, push, place the pen, then withdraw out of the right of frame",physics:"five fingers per hand, correct proportion, a plain gold band on the left hand, shirt cuff and navy sleeve visible at the wrist; no face, head or shoulders ever enter frame",must_persist:true}] },

S04:{ set_state:"almost nothing of the room is legible behind her — one small brass pendant far back on the left as a soft warm bloom, and a faint cold blue vertical edge of rain-glass on the right",
  cam:{shot_size:"close-up, head and shoulders",lens:"75mm anamorphic",aperture:"T2.0",height:"exact eye level",angle:"square to the subject",movement:"none — fully locked off",focus:"critically on the near eye",dof:"background completely soft",cuts:"none"},
  light_note:"the pendant directly overhead is the key, so the brow throws shadow into the eye sockets, there is shadow under the nose and jaw, and there is no fill at all under the chin",
  objects:[{object:"her eyes",interaction:"directed slightly off-camera left for the whole shot, one slow blink after the line lands, then back to level",physics:"the eyes move independently of the head; the head itself never turns",must_persist:true}] },

S05:{ set_state:"almost nothing of the room is legible behind him — one small brass pendant far back on the right as a soft warm bloom, near-total blackness elsewhere",
  cam:{shot_size:"close-up, head and shoulders",lens:"75mm anamorphic",aperture:"T2.0",height:"exact eye level, matched to S04",angle:"square to the subject, reverse of S04",movement:"none — fully locked off",focus:"critically on the near eye",dof:"background completely soft",cuts:"none"},
  light_note:"the pendant directly overhead is the key, so the heavy brow ridge throws deep shadow into the eye sockets and the shadow under the jaw is solid black with no fill",
  objects:[{object:"the pale scar through the outer third of his right eyebrow",interaction:"remains visible and unchanged for the entire clip",physics:"a fixed skin feature — it must not migrate, fade or duplicate",must_persist:true},
           {object:"his chair",interaction:"he leans back into it a few centimetres at the end of the shot",physics:"leather compresses and creaks once; the chair itself does not slide",must_persist:false}] },

S06:{ set_state:"the rain-glass wall runs behind both of them across the back of frame; an open black leather folder lies on the table between them, angled steeply away from the lens",
  cam:{shot_size:"two-shot, near-profile",lens:"40mm anamorphic",aperture:"T2.0",height:"table height",angle:"side-on across the table, level",movement:"none — fully locked off, no rack focus",focus:"critically on the woman's near eye",dof:"the man falls clearly soft",cuts:"none"},
  light_note:"the pendants sit between the two of them so both are rimmed and top-lit, with the cold blue rain-glass behind separating them from the background",
  objects:[{object:"the pages of the folder",interaction:"she turns exactly three pages, one at a time, unhurried, without ever looking down at them",physics:"heavy paper — each page lifts, bows under its own weight and settles flat; the pages stay angled away from the lens and never become readable",must_persist:true},
           {object:"her eyes",interaction:"stay on the man across the table the entire time and never drop to the page",physics:"the eyeline is held even while the hands work below frame centre",must_persist:true}] },

S07:{ set_state:"only the black lacquer, one sheet of heavy cream paper at about forty degrees to the lens, and the brass pen are in frame; everything beyond falls to black",
  cam:{shot_size:"extreme close macro insert",lens:"100mm anamorphic macro",aperture:"T2.8",height:"just above the table",angle:"low onto the page",movement:"none — fully locked off, no rack focus",focus:"critically on the nib alone",dof:"extremely shallow — the paper is out of focus within two centimetres of the nib in both directions",cuts:"none"},
  light_note:"the pendant directly overhead makes a hard specular highlight run down the brass barrel of the pen, and the paper carries a deep raking shadow across its lower half",
  objects:[{object:"brass fountain pen with a steel nib",interaction:"lifted slightly, settled onto the paper, drawn in ONE single slow continuous signing stroke, lifted at the end, then laid down flat beside the page",physics:"the nib stays in contact with the paper through the whole stroke and deflects very slightly under pressure; ink is wet and dark where it is laid and does not resolve into legible letters; the pen is rigid and does not bend or roll when set down",must_persist:true},
           {object:"the woman's hand",interaction:"enters from the very bottom edge of frame holding the pen and never rises far enough to reveal the wrist or sleeve",physics:"only the first joints of two fingers and part of the thumb are in frame — correct human finger count and proportion, a plain narrow gold band visible, slow controlled motion, no tremor",must_persist:true},
           {object:"the sheet of heavy cream paper",interaction:"stays flat on the lacquer and takes the pressure of the nib",physics:"heavy stock — it does not ripple, lift, slide or crease under the pen",must_persist:true}] },

S08:{ set_state:"the man's shoulder and the back of his head fill the near left third as a dark out-of-focus mass; the woman stands small and sharp at the far end; one sheet of cream paper is on the lacquer",
  cam:{shot_size:"medium, over the shoulder",lens:"40mm anamorphic",aperture:"T2.0",height:"just behind and above the man's shoulder",angle:"looking down the table past him",movement:"none — fully locked off, no rack focus",focus:"held on the distant woman",dof:"the entire foreground shoulder is heavily soft",cuts:"none"},
  light_note:"the pendants light the woman and the table between them; the man's shoulder in the near foreground is an almost black silhouette with only a thin cold blue rim from the window on his left edge",
  objects:[{object:"a single sheet of heavy cream paper",interaction:"pushed by the woman from the far end and allowed to slide the length of the table until it comes to rest in front of the man",physics:"paper on polished lacquer — it glides fast, decelerates smoothly and stops flat without fluttering, lifting or spinning; it stays blank and unreadable throughout",must_persist:true},
           {object:"her hand",interaction:"extended flat on the table after the push, then lowered at the end of the shot",physics:"a single controlled push from the wrist, no snatching back",must_persist:true}] },

S09:{ set_state:"the room falls to near black behind him with one small brass pendant bloom high on the left and a cold blue edge of rain-glass on the far right; he holds a single sheet of paper at the bottom of frame",
  cam:{shot_size:"close-up, head and shoulders, slightly off centre right",lens:"75mm anamorphic",aperture:"T2.0",height:"eye level",angle:"square to the subject",movement:"locked for the first four seconds, then ONE very slow smooth continuous push in — no more than ten percent change in frame size overall; no pan, no tilt, no shake",focus:"critically on the near eye",dof:"the held paper falls soft in the near foreground",cuts:"none"},
  light_note:"the pendant overhead keys him, and a faint cold bounce comes up off the pale paper into the underside of his jaw — the only fill anywhere in the film, and it should be barely perceptible",
  objects:[{object:"the sheet of paper he is holding",interaction:"lifted slightly and read from, then held still as his eyes stop; it stays angled steeply away from the lens for the entire clip",physics:"a small tremor runs through the held sheet; no writing, printing, letters or numbers ever become visible on it",must_persist:true},
           {object:"his eyes",interaction:"track left to right along one line, stop dead on a single point, then come off the page and go slightly out of focus past the camera",physics:"saccadic reading motion first, then a fixed stare — the change between the two is the whole point of the shot",must_persist:true}] },

S10:{ set_state:"identical to S04 — one small brass pendant far back on the left as a soft warm bloom, a faint cold blue vertical edge of rain-glass on the right, everything else black",
  cam:{shot_size:"close-up, head and shoulders",lens:"75mm anamorphic",aperture:"T2.0",height:"exact eye level, matched frame-for-frame to S04",angle:"square to the subject",movement:"none — fully locked off",focus:"critically on the near eye",dof:"background completely soft",cuts:"none"},
  light_note:"identical to S04: pendant directly overhead as key, shadow into the eye sockets, shadow under the nose and jaw, no fill at all under the chin",
  objects:[{object:"her eyes",interaction:"directed straight ahead and only slightly off-camera right; they do not move during the line and she does not blink after it",physics:"a held stare — the absence of movement is the performance",must_persist:true}] },

S11:{ set_state:"both characters in frame across the table, he at the head in the act of standing, she at the far side; the rain-glass runs the full width behind them",
  cam:{shot_size:"wide, two people",lens:"40mm anamorphic",aperture:"T2.8",height:"chest height",angle:"across the table, very slightly off-level",movement:"the ONLY handheld shot in the film — a small, slow, natural operator drift that follows him up as he stands; it must not shake, whip, snap or zoom",focus:"deep focus so both figures read",dof:"both sharp enough to read",cuts:"none"},
  light_note:"he rises up through the hard pendant light so the top light rakes down his face; she stays outside the pendant pool, lit mainly by the cold blue window",
  objects:[{object:"his chair",interaction:"pushed back hard across the marble as he stands",physics:"heavy leather and wood on stone — it scrapes, travels a short distance and stops; it does not topple",must_persist:true},
           {object:"both characters' hands",interaction:"stay at their sides or resting on the table for the entire clip",physics:"no pointing, no raised palms, no gesticulation, no walking — the stillness is deliberate",must_persist:true}] },

S12:{ set_state:"the table is completely bare — no folder, no pen, no paper anywhere on it; she walks towards camera, he stands alone at the far head",
  cam:{shot_size:"wide",lens:"40mm anamorphic",aperture:"T2.0",height:"table height, low",angle:"level, the exact reverse of S02",movement:"none — fully locked off",focus:"held on the woman at mid distance",dof:"the standing man behind her is clearly soft",cuts:"none"},
  light_note:"she passes directly under each of the three pendants in turn so the top light strikes her three times as she comes; behind her the room is dim and the man stands mostly outside the light",
  objects:[{object:"the three pendant lamps",interaction:"she passes under each one in turn as she walks towards the lens",physics:"a hard top light that strikes her, falls off, and strikes again — three distinct pools, not a continuous wash",must_persist:true},
           {object:"her heels on the marble floor",interaction:"approach the camera and then pass it as she exits frame left",physics:"the footsteps grow louder and closer, then pass the microphone position and fall away",must_persist:true}] }
};

/* Continuity that must hold across every shot in the film. */
const FILM_LOCK = {
  characters_in_film: 2,
  identity: "ELENA and ADRIAN are the same two people in every shot — same bone structure, same hair, same age. Never substitute, duplicate or re-roll a face.",
  wardrobe: "Each character wears one outfit for the entire film and it never changes.",
  fixed_marks: "ADRIAN carries a faint pale vertical scar across the outer third of his RIGHT eyebrow in every shot he appears in. ELENA has no mole and no beauty mark anywhere.",
  location: "One room, one continuous night. The set never changes.",
  axis: "The table's long axis is the axis of action. ELENA is always at the far end from the camera's opening position and ADRIAN is always at the head."
};

const NEGATIVE_LIST = [
  "no on-screen text, captions, subtitles or watermark",
  "no readable writing, letters or numbers on any surface, page or object",
  "no extra people and no crowd",
  "no plants, no artwork, no decoration",
  "no visible modern electronics, phone or laptop",
  "no lens flare",
  "no black letterbox bars rendered into the frame",
  "no gesturing, pointing or raised palms",
  "no camera shake, whip pan, snap zoom or cut"
];

/* Build the structured prompt from the SAME source fields as the prose prompt. */
function buildJSON(s){
  const st = STRUCT[s.id];
  const who = [];
  const inShot = (s.image() || "");
  if (/THE WOMAN|the woman's hand|A woman/.test(inShot)) who.push({name:"ELENA", description:ELENA, wardrobe:ELENA_FIT});
  if (/THE MAN|THE HANDS: the hands of|A man/.test(inShot)) who.push({name:"ADRIAN", description:ADRIAN, wardrobe:ADRIAN_FIT});

  const refs = s.refs.length
    ? [{slot:"@Image 1", role:"first_frame",
        defines:"framing, set, wardrobe, lighting and colour grade — continue directly from it",
        do_not_use:"nothing; this image is the shot"}].concat(
        s.refs.length === 1
          ? [{slot:"@Image 2", role:"identity_reference", file:s.refs[0],
              defines:"facial features, bone structure, hairline and skin only",
              do_not_use:"its background, clothing, lighting, pose or composition"}]
          : [])
    : [{slot:"@Image 1", role:"first_frame",
        defines:"framing, table, objects, hands, lighting and colour grade — continue directly from it",
        do_not_use:"nothing; this image is the shot"}];

  /* Action is parsed out of the video prompt's own time ranges, not the short display
     beats — those ranges are the authoritative, fully-detailed version and they already
     carry the End state lines. Parsing them keeps one source of truth for the timeline. */
  const action = (s.video().match(/^\d+-\d+ seconds:.*$/gm) || []).map(row => {
    const head = row.match(/^(\d+)-(\d+) seconds:\s*/);
    const body = row.slice(head[0].length).trim();
    const m = body.match(/End state:\s*(.+)$/i);
    const out = { time: `${head[1]}-${head[2]}s`, event: m ? body.slice(0, m.index).trim() : body };
    if (m) out.end_state = m[1].trim();
    return out;
  });

  return {
    shot_id: s.id,
    shot_title: s.title,
    duration_seconds: 10,
    aspect_ratio: "16:9",
    reference_images: refs,
    scene: {
      location: "a private dining room on the fortieth floor of an office tower",
      time_of_day: "night",
      weather: "heavy rain on the window wall outside",
      set: SET,
      set_state_at_first_frame: st.set_state
    },
    subject: who,
    action: action,
    object_interaction: st.objects,
    camera: st.cam,
    lighting: Object.assign({ scheme: LIGHT }, { this_shot: st.light_note }),
    grade: GRADE,
    audio: {
      music: s.music,
      sound_effects: s.sfx,
      dialogue_language: "British English",
      dialogue: s.lines.map(l => ({
        speaker: l.who.replace(/\s*\(off\)/,''),
        on_screen: !/\(off\)/.test(l.who),
        delivery: l.say,
        line: l.text
      }))
    },
    continuity_lock: FILM_LOCK,
    negative: NEGATIVE_LIST.slice()
  };
}
