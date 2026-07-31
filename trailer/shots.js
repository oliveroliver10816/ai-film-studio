/* The ten sustained shots. Each still prompt is written to be pasted into Flow unedited.
   Deliberately over-specified: subject, wardrobe, set, light direction, colour temperature,
   shadow ratio, lens, aperture, focus point, film stock and grade — in that order. */

const LOOK = "Shot on 35mm film, Kodak Vision3 500T stock, fine natural grain, gentle halation blooming around the brightest highlights, deep crushed blacks with a slight cool cast, filmic S-curve contrast, muted desaturated palette apart from the warm practical lights, no text, no captions, no subtitles, no watermark, no logo, no border";

const SHOTS = [
  {
    n: 1, d: 5.20, t: "Cold open — the ring", tag: null,
    job: "Establishes tone with no face to defend. Black frame, then one object. The audience is told this is about a marriage before a person appears.",
    still: `Cinematic film still from a modern noir drama. Extreme close-up of a plain unengraved yellow-gold wedding band lying on its side on a dark polished mahogany desk, the ring occupying the lower left third of the frame, its inner curve catching a bright specular highlight. Beside it and slightly out of focus, the top corner of a single sheet of cream legal paper with a fountain-pen signature running off the edge of frame, the ink still wet enough to hold a sheen.

SET: an unlit private office at night. The desk surface is deep red-brown, mirror polished, with a faint reflection of the ring and a suggestion of a window frame far behind it. Everything beyond 30 centimetres falls into total blackness.

LIGHT: one hard narrow warm tungsten beam at 3000K raking across the desk from camera left at a very low angle, almost parallel to the surface, so the ring throws a long shadow to the right. No fill at all, shadow ratio 8:1. Fine dust drifting slowly through the visible light beam.

CAMERA: 100mm macro lens at f/2.8, camera at desk height, focus precisely on the near edge of the ring, the paper and the background thrown into soft blur.

${LOOK}.`,
    motion: "The ring finishes settling, wobbling twice and coming to rest flat on the polished wood, dust drifting slowly through the light beam above it, a faint reflection shifting on the desk surface, the camera pushes in very slowly and steadily, nothing else in frame moves",
    line: { who: "Elena — voice over", text: "Everyone at the funeral told me to let it go.", file: "01_elena_funeral.wav", note: "Flat. Not sad. A statement of fact she has repeated too many times." }
  },
  {
    n: 2, d: 6.20, t: "Elena at the window", tag: null, ref: "elena — three-quarter right",
    job: "First face, and deliberately the safest possible one: behind rain-streaked glass, backlit, half in shadow. This is the exact shot already proven on the machine.",
    still: `Cinematic film still from a modern noir drama. Medium close-up, from the chest up, of ELENA standing just inside a floor-to-ceiling office window at night, positioned slightly right of centre in frame, her body angled 45 degrees away and her face turned back toward the lens.

SUBJECT: {ELENA}. Her expression is composed and unreadable, lips closed, eyes steady.

WARDROBE: a charcoal grey wool overcoat with a notch lapel and the collar turned up at the back of her neck, worn open over a plain black high-neck top. No jewellery, no earrings.

SET: rain running down the outside of the glass in irregular vertical streaks, beading and breaking and running again, the glass itself faintly smeared. Beyond it a city at night thrown completely out of focus into large round bokeh discs — warm sodium orange, cold white, one small red aircraft light.

LIGHT: key from a warm practical lamp inside the room at camera left, 3200K, striking the left half of her face and letting the right side fall into deep shadow, shadow ratio 4:1. Cold blue-white spill from the window at 6500K rims her jaw, her cheekbone and the shoulder of the coat. No fill on the shadow side.

CAMERA: 50mm anamorphic lens at T2.0, camera at her eye level, focus locked on her near eye, the rain on the glass slightly forward of focus, one horizontal blue anamorphic flare across the upper third.

${LOOK}.`,
    motion: "She turns her head slowly toward the camera and her eyes settle and hold, rain continuing to run and break down the glass in front of her, the out-of-focus city lights flickering and shifting gently behind her, the camera holds absolutely still"
  },
  {
    n: 3, d: 4.20, t: "Adrian signs", tag: null, ref: "adrian — full profile",
    job: "Introduce him without showing him properly. Backlit to near-silhouette — the cheapest shot in the film and one of the strongest.",
    still: `Cinematic film still from a modern noir drama. Wide shot of ADRIAN seated at the head of a long empty boardroom table, seen from behind and to his right so that he reads as an almost solid silhouette against a wall of bright windows. His right hand rests on a document on the table, holding a fountain pen.

SUBJECT: {ADRIAN}. Only the edge of his brow, the line of his nose and the grey at his temple catch any light.

WARDROBE: a navy three-piece suit, waistcoat buttoned, jacket on, collar open one button and no tie.

SET: a corporate boardroom, twelve empty leather chairs receding down a long dark table, a wall of floor-to-ceiling windows behind him blown out to pure white by daylight. The foreground corner of the table is a heavy black shape crossing the bottom of frame.

LIGHT: hard overexposed daylight from behind at 6000K blowing the windows to clipped white and throwing a strong rim along his shoulder, temple and jaw. The room side of him receives almost no fill, shadow ratio 10:1, his suit reading as near-black. Visible dust and haze in the backlight.

CAMERA: 28mm wide lens at f/4, camera at seated eye height and slightly behind him, focus on his shoulder line, the far end of the table softly out of focus.

${LOOK}.`,
    motion: "His hand completes the last stroke of the signature and lifts the pen away from the paper, he leans back slowly into the chair, dust drifting through the hard backlight behind him, the camera stays completely static"
  },
  {
    n: 4, d: 6.30, t: "The long table", tag: null, ref: "both — full length",
    job: "The whole relationship in one frame: two people at opposite ends of a table, neither face readable. Distance does the acting, so neither face has to hold.",
    still: `Cinematic film still from a modern noir drama. Extreme wide, perfectly symmetrical, dead-centre one-point perspective down the length of an enormous formal dining table. ELENA is seated at the far end facing camera, ADRIAN at the near end with his back to camera, both small in frame and neither face legible.

SUBJECTS: {ELENA} in a black satin gown with bare shoulders. {ADRIAN} in the navy three-piece suit, seen from behind, the back of his head and shoulders a dark mass in the lower foreground.

SET: a vast unlit dining room in an old house. A single unbroken line of nineteen white candles in low holders runs down the centre of the table between them. Two place settings, untouched. The walls and ceiling are lost to blackness; only the table and the candle line are lit.

LIGHT: the candles are the only source, 1900K, warm orange, lighting the tabletop and the underside of both faces and falling off completely within a metre of the table edge. Shadow ratio beyond 12:1. No fill, no practicals, no moonlight.

CAMERA: 35mm lens at f/2.8, camera at table height exactly on the centre line, focus on the middle of the candle run so both figures are slightly soft, deep blackness filling the top third of the frame.

${LOOK}.`,
    motion: "Every candle flame flickers and leans slightly as if from one slow draught, both figures remain perfectly still and neither moves nor turns, the camera pushes very slowly down the length of the table toward her"
  },
  {
    n: 5, d: 4.30, t: "The folder", tag: null,
    job: "Plot delivered by object rather than exposition. Hands only, so no face has to hold at all.",
    still: `Cinematic film still from a modern noir drama. Tight close-up of two pairs of hands on a dark polished table. A woman's hands — slim, short unpainted nails, no rings — slide a slim manila folder across the surface toward a man's larger hand, which rests flat and motionless, palm down, fingers spread, a plain gold band on the ring finger.

WARDROBE: her forearms in an oxblood red silk blouse, the cuff unbuttoned and pushed back; his forearm in a white shirt sleeve under a navy suit cuff.

SET: the same polished dark table, the folder plain and unlabelled, a single water glass out of focus in the far background.

LIGHT: one warm low practical at 2900K from camera right, skimming across the table so the folder casts a hard shadow to the left, the hands lit from the side to bring out skin texture and tendon. Everything past the hands falls to black, shadow ratio 6:1.

CAMERA: 50mm lens at f/2.0, camera low and close at table height, focus on the leading edge of the folder, both faces entirely out of frame above the top edge.

${LOOK}.`,
    motion: "The folder slides steadily across the table and stops just under his fingertips, her hands release it and withdraw slowly out of the bottom of frame, his hand does not move at all, the camera stays static"
  },
  {
    n: 6, d: 6.90, t: "Adrian — the accusation", tag: "dlg", ref: "adrian — front, eye level",
    job: "First held close-up of him and the film's turn. Shallow focus, one light, plain dark field behind — the safest possible way to hold a face for seven seconds.",
    still: `Cinematic film still from a modern noir drama. Tight close-up of ADRIAN, head and the top of his shoulders filling the frame, looking directly down the lens.

SUBJECT: {ADRIAN}. His expression is still and certain, jaw set, eyes locked forward, no anger in the face.

WARDROBE: navy suit jacket and white shirt with the collar open one button, no tie, only the shoulders and collar in frame.

SET: an unlit room. The background is plain, dark and featureless, with one small warm practical light far behind him thrown completely out of focus into a single soft orange disc over his right shoulder.

LIGHT: a single hard key at 3200K from camera right and slightly above, modelling the right side of his face, catching the brow ridge, the bridge of the nose and the scar through his right eyebrow, and leaving the entire left side of his face in deep shadow. Shadow ratio 5:1, no fill, a faint cool 5600K rim on the left edge of his jaw to separate him from the background.

CAMERA: 85mm lens at T1.4, camera at his eye level, focus critically on his near eye with the far eye already softening, background completely dissolved.

${LOOK}.`,
    motion: "He speaks one short line directly into the lens with minimal jaw movement and no head movement, his eyes stay locked forward the whole time, one slow blink as he finishes, the camera is absolutely static",
    line: { who: "Adrian — on camera", text: "You married me to take it back.", file: "02_adrian_takeitback.wav", note: "Quiet. Certain. He is not asking, and he is not angry. Slight downward inflection on the last word." }
  },
  {
    n: 7, d: 4.50, t: "The staircase", tag: null, ref: "elena — full length",
    job: "The film's only spectacle. Motion, flashbulbs and a gown — and it is over in four and a half seconds, before anything can be examined.",
    still: `Cinematic film still from a modern noir drama. Full-length shot of ELENA descending a wide pale marble staircase, framed from slightly below so the camera looks up at her, the staircase filling the frame diagonally.

SUBJECT: {ELENA}. Chin level, gaze fixed ahead and past the camera, expression composed.

WARDROBE: a floor-length black satin gown with bare shoulders and a narrow strap, the fabric catching hard specular highlights along every fold, the hem trailing one step behind her.

SET: a grand marble staircase with a dark iron balustrade, an unlit hall beyond, the bottom of frame crossed by the blurred dark shapes of press photographers' heads and raised cameras.

LIGHT: irregular hard white flashgun bursts firing from below frame left and right at 5600K, each one blowing out the satin and throwing hard fast shadows up the wall behind her. Between the bursts the hall is almost black. Extreme contrast, shadow ratio beyond 8:1, one continuous cold overhead source giving a faint blue base exposure.

CAMERA: 35mm lens at f/2.8, camera low on the stairs looking up, focus on her waist so her whole figure is acceptably sharp, slight motion blur in the moving gown.

${LOOK}.`,
    motion: "She descends two steps at an even unhurried pace, camera flashes burst irregularly from below and snap her face and gown into hard white light, the satin moves and catches light with her, the camera rises slightly to meet her"
  },
  {
    n: 8, d: 6.80, t: "Elena — the answer", tag: "dlg", ref: "elena — front, eye level",
    job: "The payoff line and the longest held face in the film. Everything before this exists to earn seven seconds of one face not moving.",
    still: `Cinematic film still from a modern noir drama. Tight close-up of ELENA, head and the top of her bare shoulders filling the frame, looking directly down the lens.

SUBJECT: {ELENA}. Her eyes are wet and reflective but she is not crying and no tear has fallen; the lower lids hold the water. Her expression is calm and completely resolved.

WARDROBE: the black satin gown, only the strap and the top of one shoulder in frame.

SET: an unlit room. The background is plain, dark and featureless, with one warm practical far behind her rendered as a single soft out-of-focus orange disc over her left shoulder.

LIGHT: a single cool key at 5000K from camera left and slightly above, modelling the left side of her face, catching the cheekbone, the wet lower lid and the edge of her lip, leaving the right side of her face in shadow. Shadow ratio 4:1, a small amount of soft bounce fill on the shadow side so her far eye is still readable. A faint warm 3000K rim on her right shoulder from the practical behind.

CAMERA: 85mm lens at T1.4, camera at her eye level, focus critically on her near eye, the background completely dissolved, a specular catchlight visible in both eyes.

${LOOK}.`,
    motion: "She holds the lens without blinking, speaks one short line with very little jaw movement, then one slow blink as she finishes and her eyes come back to the lens, nothing else in the frame moves, the camera is absolutely static",
    line: { who: "Elena — on camera", text: "I married you to take all of it.", file: "03_elena_allofit.wav", note: "Almost a whisper. No triumph. Land hard on “all”, then let the last two words fall away." }
  },
  {
    n: 9, d: 4.50, t: "Adrian alone", tag: null, ref: "adrian — rear three-quarter",
    job: "Consequence without dialogue. Back to camera again — free to generate, and it reads as defeat.",
    still: `Cinematic film still from a modern noir drama. Wide shot of ADRIAN standing alone at the glass wall of a dark high-rise office at night, seen from behind and slightly to his left, his right hand flat against the window at shoulder height, his head lowered a few degrees. He occupies the right third of the frame.

SUBJECT: {ADRIAN}, seen from behind — the back and left side of his head, the grey at his temple, the hairline at his nape and the collar of his shirt. His face is visible only as a faint partial reflection in the glass, slightly doubled by the two surfaces of the pane.

WARDROBE: navy suit trousers and waistcoat, jacket off, white shirtsleeves rolled to the forearm.

SET: an unlit corner office, the city grid glowing far below and stretching to the horizon, thousands of small warm and cold lights, a few tower rooftops at his eye level. Faint smears and a single handprint on the inside of the glass.

LIGHT: the city is the only source — cold blue-white at 6500K from below and in front, rimming his shoulder, the side of his head and his forearm, and leaving the room behind him in near-total blackness. No warm light anywhere. Shadow ratio beyond 10:1.

CAMERA: 35mm lens at f/2.0, camera at his shoulder height and two metres behind him, focus on the glass at his hand so the city beyond is a soft field of light, his silhouette edge slightly soft.

${LOOK}.`,
    motion: "His hand stays flat against the glass and his head lowers very slightly further, the city lights below shift and flicker faintly, his faint reflection moves with him in the glass, the camera drifts a few centimetres to the right"
  },
  {
    n: 10, d: 4.30, t: "The elevator", tag: "vo", ref: "both — front, eye level",
    job: "Last sustained shot. Two faces, one frame, neither looking at the other — and the doors take the image away for you, so the shot ends itself.",
    still: `Cinematic film still from a modern noir drama. Symmetrical medium-wide shot from inside a lift looking straight at ELENA and ADRIAN standing side by side against the back wall, both facing directly forward toward the camera, neither looking at the other, a deliberate gap of empty space between their shoulders.

SUBJECTS: {ELENA} on the left in the charcoal wool overcoat, collar up. {ADRIAN} on the right in the navy three-piece suit. Both expressions are neutral and forward, mouths closed.

SET: the interior of a brushed steel lift, vertical grain in the metal, a faint distorted reflection of both of them in the rear wall, a row of floor buttons glowing dull amber at the right edge of frame. The open doors frame both sides of the image.

LIGHT: a single hard fluorescent panel directly overhead at 4300K, casting their eye sockets into shadow and putting a hot highlight on the crown of each head and the tops of their shoulders. Cold, flat, unflattering, no fill from below, shadow ratio 6:1.

CAMERA: 35mm lens at f/4, camera at chest height dead centre, both subjects equally sharp, the steel wall behind them softly out of focus.

${LOOK}.`,
    motion: "Both stand perfectly still facing forward and neither turns nor looks at the other, the lift doors slide closed from both sides across the frame at an even speed, the overhead light dimming on their faces as the gap narrows to a vertical line and closes",
    line: { who: "Elena — voice over", text: "He taught me how to do this. He just never thought I was taking notes.", file: "04_elena_notes.wav", note: "The only line with any dryness in it. Two sentences, small pause between. Runs over this shot and into the montage." }
  }
];

const MONTAGE = [
  ["A fountain-pen nib tearing through paper", "new"],
  ["A champagne flute set down hard on stone", "new"],
  ["Elena's eyes, snap close-up", "reuse S08"],
  ["Boardroom doors swinging open", "new"],
  ["A phone screen going dark", "new"],
  ["Adrian's hand closing into a fist", "reuse S09"],
  ["Rain hammering the window", "reuse S02"],
  ["The ring pushed onto a finger", "reuse S01"],
  ["An empty chair spinning to a stop", "new"],
  ["Press flashes, pure white", "reuse S07"],
  ["Elena's back turning away", "reuse S10"],
  ["Nineteen candles blown out at once", "reuse S04"],
  ["Adrian's face in the glass", "reuse S09"],
  ["Black", "—"]
];
