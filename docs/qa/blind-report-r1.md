# Gate 3 – Blind-Lösen: Abgleich

**Gesamt:** 535 Items, 6 Abweichungen, 44 Hinweise.

## A-speed-numerical

90 Items · Übereinstimmung 90/90 · Abweichungen 0 · Hinweise 2

- Hinweis numerical-L3-12 (g:num.projection@1:3:2391617787): 'Keeps growing at its average annual rate from 2023 to 2025' is not fully unambiguous: read as the compound growth rate (CAGR), 104.8 x (104.8/75.4) = 145.66 (C). Read as the average absolute increase per year ((104.8-75.4)/2 = 14.7 TWh/yr), 104.8 + 2 x 14.7 = 134.20, and that is option B. Suggest writing 'average annual growth rate (CAGR)' or 'average annual percentage growth rate'. The word order also lets 'from 2023 to 2025' attach to 'keeps growing' instead of to the rate.
- Hinweis numerical-L1-12 (g:num.projection@1:1:124535277): Minor wording problem: 'If costs for Materials change ... what will it be in 2026?' The plural 'costs' does not agree with 'it'. Suggest 'what will they be' or 'what will Materials costs be'. The answer itself is unambiguous (1,315 + 45 = 1,360.0, C).

## B-deductive-diagrammatic

90 Items · Übereinstimmung 90/90 · Abweichungen 0 · Hinweise 8

- Hinweis deductive-L1-02 (g:ded.ordering@1:1:1288144352): Correct and unique, but trivial: the question ('In which place did Anna finish?') is answered verbatim by statement 1 ('Anna finished 3rd'); statement 2 is irrelevant. No deduction is tested.
- Hinweis deductive-L1-03 (g:ded.seating@1:1:4087721122): Correct and unique, but trivial: the question ('Who sits in seat 3?') is answered verbatim by statement 2 ('Anna sits in seat 3'). No deduction is tested.
- Hinweis deductive-L1-08 (g:ded.seating@1:1:4037388265): Correct and unique, but trivial: the question ('Who sits in seat 3?') is answered verbatim by statement 3 ('Ben sits in seat 3'). No deduction is tested.
- Hinweis deductive-L1-12 (g:ded.ordering@1:1:2937563139): Correct and unique, but trivial: the question ('Who finished 3rd?') is answered verbatim by statement 2 ('Anna finished 3rd'). No deduction is tested.
- Hinweis deductive-L2-08 (g:ded.seating@1:2:1178898216): Minor wording issue: the setup never names the five people. The correct answer, Anna, is never mentioned in the statements, so the solver has to assume that the unnamed fifth person is Anna; it is reachable only by eliminating the answer options. Listing the roster (Anna, Ben, Clara, David, Eva) would fix this.
- Hinweis deductive-L2-15 (g:ded.tfc@1:2:1237728962): Correct, but trivial: 'David finished ahead of Eva' follows directly from statement 1 ('David finished 1st'); the other statements are irrelevant.
- Hinweis deductive-L3-07 (g:ded.ordering@1:3:2899200927): Correct and unique (two valid orderings, only C holds in both), but trivial for level 3: C ('Eva finished ahead of Clara') follows directly from statement 5 ('Eva finished 1st'), and the other constraints are irrelevant. The roster is also not given (Anna appears only in the options).
- Hinweis deductive-L3-12 (g:ded.ordering@1:3:649692277): Correct and unique, but trivial for level 3: B ('Clara finished ahead of Ben') is a weakening of statement 2 ('Clara finished directly ahead of Ben'), and the other constraints are irrelevant. Felix appears only in the options; the roster is not given.

## C-inductive

45 Items · Übereinstimmung 45/45 · Abweichungen 0 · Hinweise 10

- Hinweis inductive-L1-03 (g:ind.odd@1:1:2556976752): Ambiguous: two equally simple rules single out different options. D = only panel with two black shapes / the only black pentagon (rule 'exactly one black shape' or 'shapes differ in fill'). B = only panel where the hexagon is BELOW the pentagon (in A, C, D, E the hexagon is in the top row and the pentagon in the bottom row). Positions and fills are both random-looking, so neither rule is clearly the intended one. I chose D.
- Hinweis inductive-L1-09 (g:ind.odd@1:1:2724752942): Ambiguous: at least two equally plausible answers. D = only panel with an empty (non-black) star, and the only one with the square in the right column. B = only panel where both shapes are black / the two fills are identical, and the only one with the square in the bottom row. (C is also unique as the only panel with the star in the top row.) I chose B for consistency with L1-03/L1-15 ('exactly one black shape per panel'), but many candidates will pick D, and that is just as defensible.
- Hinweis inductive-L1-15 (g:ind.odd@1:1:3260286631): Ambiguous: no single-attribute rule works, and several relational rules give different answers. C = only panel without a black shape (and the only one with both shapes side by side in the top row). B = only panel with the shapes in diagonally opposite corners (all others use two corners that share a side). D = only black diamond. I chose C ('exactly one black shape').
- Hinweis inductive-L2-06 (g:ind.odd@1:2:786735372): Rule hard to find: A (4 ticks) and B (1 tick) both differ from the 6-tick majority, so 'number of ticks' alone does not decide. B is unique only by parity (the only odd tick count) or by being the only round shape. Fills (3 empty / 2 striped) and shapes give no single odd one. The answer is probably unique, but candidates could reasonably choose A.
- Hinweis inductive-L2-10 (g:ind.series@1:2:3557581976): Readability: each cross sits directly on the tick row, and its bottom arm merges with the middle ticks. In panel 1 the two ticks look like legs of the cross. Ticks are hard to count, and the options differ by just one tick (C 6, A/B/D 7, E 8).
- Hinweis inductive-L2-13 (g:ind.series@1:2:1768871606): Readability: the chevrons in panels 1-5 and in several options are cut off by the right panel border (the vertex of the '>' shapes is clipped). The answer is still found via fill cycle + alternating orientation, but the clipping hides part of each figure.
- Hinweis inductive-L3-01 (g:ind.series@1:3:1853171144): Minor readability issue: the large chevron in panel 3 and the chevron in option C are clipped at the right panel border. The answer is not affected.
- Hinweis inductive-L3-10 (g:ind.series@1:3:1735727811): Hard to read and the rule is hard to see: several figures are clipped at the panel border (panel 2 at top and left, panel 4 at left, option C at right). The rule is rotation by 135° plus a mirror at each step (panels 2 and 4 are mirrored relative to 1/3/5), and the mirroring can only be seen from arm lengths, which the clipping partly hides. The correct option C differs from A only in size, and C is itself clipped.
- Hinweis inductive-L3-11 (g:ind.matrix@1:3:2323548613): Minor: the diamond in row 2/column 3 is drawn large while every other diamond is small. No rule explains this, and it may make solvers look for a size rule. It does not change the answer (option C, the large diamond, fails the line and fill rules).
- Hinweis inductive-L3-14 (g:ind.matrix@1:3:2273215756): Readability: in options A and C the BLACK L-shape sits exactly on the crossing point of four black lines (8-spoke star). At normal size its orientation (^ in A vs V in C) is barely visible; that orientation is the only difference between A and C.

## D-aon-interactive

90 Items · Übereinstimmung 90/90 · Abweichungen 0 · Hinweise 8

- Hinweis interactive-L2-03 (g:int.tablefill@1:2:2323274257): Computed share 544/2446 = 22.24% -> 22.2, but 100% minus the displayed (rounded) shares gives 22.3. Two natural methods disagree; accept 22.2 and 22.3 or adjust data.
- Hinweis interactive-L2-06 (g:int.tablefill@1:2:2340051876): Computed share 298/2846 = 10.47% -> 10.5, but 100% minus the displayed (rounded) shares gives 10.4. Two natural methods disagree; accept 10.4 and 10.5 or adjust data.
- Hinweis interactive-L3-03 (g:int.tablefill@1:3:199422950): 2571 x 0.951 = 2445.02 -> 2445, but because the displayed -4.9% is rounded, 2444 and 2446 also produce -4.9%. If the key stores the original integer instead of the recomputed value it may differ by 1; accept +-1.
- Hinweis interactive-L3-06 (g:int.tablefill@1:3:249755807): 1982 x 0.978 = 1938.40 -> 1938, but 1939 also rounds to -2.2%. If the key stores the original integer it may be 1939; accept +-1.
- Hinweis interactive-L3-02 (g:int.order@1:3:3014106770): Wording: table titled "Revenue and profit" but unit given as TWh, which makes no sense for revenue/profit (answer unaffected).
- Hinweis interactive-L3-05 (g:int.order@1:3:2963773913): Wording: "Revenue and profit" table with unit "thousand units" - nonsensical unit for revenue/profit (answer unaffected).
- Hinweis interactive-L3-08 (g:int.order@1:3:2913441056): Wording: "Revenue and profit" table with unit "million passengers" - nonsensical unit for revenue/profit (answer unaffected).
- Hinweis interactive-L3-11 (g:int.order@1:3:1927198982): Wording: "Revenue and profit" table with unit "million passengers" - nonsensical unit for revenue/profit (answer unaffected).

## E-verbal

160 Items · Übereinstimmung 155/160 · Abweichungen 5 · Hinweise 12

- **Abweichung v21-2** (b:verbal:v21-2@1): Schlüssel "C" · Löser "B" · Hinweis: 'subject to approval by the European Commission' implies approval is still pending (B), but it is not stated outright that the Commission has not yet approved, so C is defensible. Compare v11-1, where 'still requires approval' is unambiguous.
- **Abweichung v29-4** (b:verbal:v29-4@1): Schlüssel "C" · Löser "B" · Hinweis: The warning that waiting times 'may still exceed 30 minutes' has no explicit time frame. It could refer only to the period before all lanes are upgraded (C) or be a general warning that contradicts 'will never' (B). I chose B; C is defensible.
- **Abweichung v35-3** (b:verbal:v35-3@1): Schlüssel "C" · Löser "B" · Hinweis: 'its 600 largest suppliers' presupposes more than 600 suppliers (B), but the total is never stated, so C is defensible.
- **Abweichung v36-1** (b:verbal:v36-1@1): Schlüssel "C" · Löser "A"
- **Abweichung v36-4** (b:verbal:v36-4@1): Schlüssel "B" · Löser "C" · Hinweis: 'intends to close up to 20' versus 'will close at least 20': exactly 20 would make the statement true, and an intention is not a certainty, so C. Item writers often key this kind of up-to/at-least contrast as B.
- Hinweis v03-4 (b:verbal:v03-4@1): Minor: 'a member who has spent 500 euros' does not say the spending was in a participating store, after joining, or that points were not already redeemed. A is the intended reading; a very strict candidate could choose C.
- Hinweis v05-3 (b:verbal:v05-3@1): 'most of them from the old town' only implies, and does not strictly entail, that some complaints came from elsewhere. B relies on that implicature; under strict formal logic ('most' does not exclude 'all') C can be defended. Consider stating explicitly that some complaints came from other districts.
- Hinweis v10-4 (b:verbal:v10-4@1): 'turned into insulation material or cleaning cloths' – the 'or' does not strictly guarantee that any textiles actually became insulation. A is the natural reading, but C is arguable. 'and' or 'some ... into insulation' would remove the doubt.
- Hinweis v22-4 (b:verbal:v22-4@1): Volume +6% and average price 'fell slightly'. Revenue would only fall if the price dropped by more than about 5.7%, which is hard to call 'slightly', so B can be argued. Because 'slightly' is not quantified, C is the stricter answer. Give a figure for the price fall, or reword the statement.
- Hinweis v28-3 (b:verbal:v28-3@1): 'will make up half of its fleet by 2028' (plus 'investing in more') implies the share is currently below half (B), but the current share is never stated, so C is defensible. It depends on how strictly time references are read.
- Hinweis v28-4 (b:verbal:v28-4@1): The passage only reports the consumer organisation's argument ('it can take decades'); it does not state this as fact or describe Aurel's projects specifically, so C. Many candidates would choose B based on the criticism.
- Hinweis v34-2 (b:verbal:v34-2@1): 'almost half of its operating costs' does not strictly prove electricity is the largest single cost: another single item could in theory be slightly larger (e.g. 49% vs 50%). The natural reading suggests A; strict arithmetic gives C. Use 'more than half', or state it is the largest cost.
- Hinweis v36-3 (b:verbal:v36-3@1): Only the new cafés (45 of 310) are said to be mostly at stations or motorways, so C. 'rather than in city centres' and 'the older city-centre cafés' hint that the older cafés are in city centres, which would make B arguable.

## F-critical

60 Items · Übereinstimmung 59/60 · Abweichungen 1 · Hinweise 4

- **Abweichung c02** (b:critical:c02@1): Schlüssel "C" · Löser "B" · Hinweis: C (Insufficient data) is defensible: the passage only commits to Sunday opening until the end of the year and says nothing about next year. I chose B because 'at least until the end of the year' leaves continuation open and Sunday is the busiest day, which makes continuation more likely than not.
- Hinweis c10 (b:critical:c10@1): B (Probably true) is defensible: 0.8 x 1.35 = 1.08 gives an 8% revenue increase, but the passage does not explicitly say that the 35% rise is measured against the previous six months, or that the 20% cut applied uniformly across channels and the whole period.
- Hinweis c15 (b:critical:c15@1): B (Assumption not made) is defensible if 'assumption' means only unstated premises: the statement says outright that many potential customers listen to the radio while driving to work, so 'some drive to work' is stated rather than taken for granted. Under the usual Watson-Glaser reading (the speaker must take it for granted for the argument to work) it is made.
- Hinweis c05 (b:critical:c05@1): Minor: C is arguable, because the passage does not say why the two teachers were hired. B still fits best, since the maximum is the school's own recommendation and classes 'still' exceed it.
