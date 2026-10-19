# Safety model

Safety decisions are made in `lib/skincare` before a routine is shown. Generated sentences cannot put a blocked product back. `applyExternalSuggestion` records rejected product ids and does not add them to the plan. `validateExplanation` rejects prose that tells someone to use a blocked product or promises a cure.

## Levels

| Level | Meaning |
| --- | --- |
| BLOCK | Confirmed allergy match, severe or emergency reaction, or an explicit label or prescriber conflict |
| HIGH_CAUTION | Suspected sensitivity, pregnancy retinoid or leave-on salicylic acid withhold, or an irritating active during reported irritation |
| CAUTION | Cumulative irritation, such as two leave-on acids or a retinoid with an acid, when tolerance is unknown |
| INFORMATION | A formulation-dependent note, including retinoid with benzoyl peroxide when no label forbids it |
| COMPATIBLE | No specific issue found in the stored data. Not a claim of universal safety |
| UNKNOWN | The ingredient list is missing, incomplete, or unconfirmed |

An empty search is never reported as allergy-safe.

## Rules that override scores

- Confirmed allergen, including the alias parfum for fragrance, and named fragrance allergens when the allergy is to fragrance
- Incomplete ingredient list when any confirmed allergy exists
- Unconfirmed extracted text
- Severe or emergency reaction on that product
- Retinoids when the profile says pregnant or trying to conceive
- Leave-on salicylic acid in that same pregnancy context, because strength is often unknown
- Recent moderate or severe irritation: irritating actives, including prescriptions, are not scheduled. The copy tells the person to contact the prescriber rather than presenting a dose change
- A product label that says not to combine with a class, including a prescription adapalene instruction not to use other leave-on exfoliants
- Only one new irritating active is introduced at a time
- Prescription days-per-week are not increased
- Two leave-on exfoliants or other irritating actives alternate instead of stacking when no label has already removed them

Goal relevance never restores a blocked product.

## Sunscreen

A sunscreen is described as SPF 30 or higher, broad spectrum, or water resistant only when those fields were entered from the label. Guidance to prefer SPF 30, broad spectrum, and water resistance, and to reapply about every two hours outdoors including cloudy days, follows American Academy of Dermatology pages cited in the claim library. Rain does not cancel that reminder. Sunscreen is not described as complete protection.

## Emergencies and patch testing

Trouble breathing, swelling of the tongue or throat, faintness, blistering, or a rapidly spreading reaction is treated as an emergency message, not a routine adjustment.

A home trial can show obvious irritation. It cannot rule out allergy, and it is not clinician-led diagnostic patch testing. That sentence is safety education in the product. It is not stored as a graded study claim.

## Professional care

If someone says they have a diagnosed condition, significant inflammation, a history of severe reactions, or a complex medication concern, the app says to involve a clinician and will not use a goal-focused mode. It can still organize gentle products and a recorded prescription schedule when irritation is not the reason for holding that prescription.
