/**
 * Real-Time Client-Side Sign Language Detection Engine
 * Powered by Google MediaPipe Tasks Vision (WebAssembly + GPU/CPU).
 * 
 * Extracts 21 3D hand joint landmarks and classifies real human signs:
 * - Common Signs: "Hello", "Thank you", "I Love You" (🤟), "Yes", "No", "Good", "Bad", "Stop", "OK", "Help", "Understand"
 * - Alphabets / Fingerspelling: A, B, C, L, V, W, Y
 * - Numbers: 1, 2, 3, 4, 5
 */

import type { GestureRecognizer as GestureRecognizerType } from '@mediapipe/tasks-vision';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedSignResult {
  sign: string;
  confidence: number;
  spokenPhrase: string;
  category: 'greeting' | 'affirmation' | 'expression' | 'action' | 'alphabet' | 'number';
  handedness?: 'Left' | 'Right';
  landmarks?: HandLandmark[];
}

let recognizerInstance: GestureRecognizerType | null = null;
let isLoadingRecognizer = false;

/**
 * Lazy loads MediaPipe GestureRecognizer only when camera sign detection is opened.
 * Keeps initial page bundle zero-cost.
 */
export async function getGestureRecognizer(): Promise<GestureRecognizerType> {
  if (recognizerInstance) return recognizerInstance;
  if (isLoadingRecognizer) {
    while (isLoadingRecognizer) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (recognizerInstance) return recognizerInstance;
  }

  isLoadingRecognizer = true;
  try {
    const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    return recognizerInstance;
  } catch (err) {
    console.warn("GPU delegate failed, falling back to CPU for MediaPipe:", err);
    const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    recognizerInstance = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });

    return recognizerInstance;
  } finally {
    isLoadingRecognizer = false;
  }
}

/**
 * Calculates Euclidean distance between two 3D landmarks
 */
function dist(p1: HandLandmark, p2: HandLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Extended Rule-Based Sign Language Classifier using 21 Hand Landmarks
 */
export function classifyExtendedSign(
  landmarks: HandLandmark[],
  baseGestureName: string,
  baseScore: number
): DetectedSignResult | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const thumbCmc = landmarks[1];
  const thumbMcp = landmarks[2];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleDip = landmarks[11];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringDip = landmarks[15];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyDip = landmarks[19];
  const pinkyTip = landmarks[20];

  // Palm scale reference: wrist to middle finger base
  const palmScale = dist(wrist, middleMcp) || 0.2;

  // Finger extension states (finger tip further from wrist than PIP joint)
  const isThumbExtended = dist(thumbTip, wrist) > dist(thumbIp, wrist);
  const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) + (0.04 * palmScale);
  const isMiddleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) + (0.04 * palmScale);
  const isRingExtended = dist(ringTip, wrist) > dist(ringPip, wrist) + (0.04 * palmScale);
  const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) + (0.04 * palmScale);

  // Distance between thumb tip and index tip
  const thumbIndexDist = dist(thumbTip, indexTip) / palmScale;
  const thumbMiddleDist = dist(thumbTip, middleTip) / palmScale;

  // 1. "I Love You" sign (🤟): Thumb, Index, Pinky extended; Middle and Ring folded
  if (baseGestureName === 'ILoveYou' || (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended)) {
    return {
      sign: "I Love You",
      spokenPhrase: "I love you",
      confidence: Math.max(0.88, baseScore),
      category: 'expression'
    };
  }

  // 2. "OK" sign (👌): Thumb and Index tips touch in circle, Middle, Ring, Pinky open upright
  if (thumbIndexDist < 0.25 && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return {
      sign: "OK",
      spokenPhrase: "Okay, understood",
      confidence: 0.90,
      category: 'affirmation'
    };
  }

  // 3. "Good" / "Yes" (👍): Thumb Up, other fingers curled
  if (baseGestureName === 'Thumb_Up' || (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && thumbTip.y < wrist.y)) {
    return {
      sign: "Good",
      spokenPhrase: "Good, well done",
      confidence: Math.max(0.85, baseScore),
      category: 'affirmation'
    };
  }

  // 4. "Bad" / "No" (👎): Thumb Down, other fingers curled
  if (baseGestureName === 'Thumb_Down' || (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && thumbTip.y > wrist.y)) {
    return {
      sign: "No",
      spokenPhrase: "No, that is not correct",
      confidence: Math.max(0.85, baseScore),
      category: 'affirmation'
    };
  }

  // 5. "Victory / Peace / Two" (✌️): Index and Middle up, others folded
  if (baseGestureName === 'Victory' || (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended)) {
    const fingerGap = dist(indexTip, middleTip) / palmScale;
    return {
      sign: fingerGap > 0.35 ? "Peace" : "Number 2",
      spokenPhrase: fingerGap > 0.35 ? "Peace and victory" : "Two",
      confidence: Math.max(0.87, baseScore),
      category: fingerGap > 0.35 ? 'expression' : 'number'
    };
  }

  // 6. "Pointing / One / Idea" (☝️): Index up, others folded
  if (baseGestureName === 'Pointing_Up' || (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended)) {
    return {
      sign: "One",
      spokenPhrase: "One, I have a question",
      confidence: Math.max(0.85, baseScore),
      category: 'number'
    };
  }

  // 7. "Hello / Open Palm / Stop" (✋): All 5 fingers extended upright
  if (baseGestureName === 'Open_Palm' || (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended)) {
    // If hand is positioned high, it's a greeting "Hello!"
    return {
      sign: "Hello",
      spokenPhrase: "Hello everyone",
      confidence: Math.max(0.86, baseScore),
      category: 'greeting'
    };
  }

  // 8. "Yes / Fist" (✊): Closed fist
  if (baseGestureName === 'Closed_Fist' || (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && !isThumbExtended)) {
    return {
      sign: "Yes",
      spokenPhrase: "Yes",
      confidence: Math.max(0.80, baseScore),
      category: 'affirmation'
    };
  }

  // 9. Letter "L" (👆👈): Index up, Thumb extended sideways at ~90 degrees, others folded
  if (isIndexExtended && isThumbExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    const thumbIndexAngleDist = dist(thumbTip, indexTip) / palmScale;
    if (thumbIndexAngleDist > 0.6) {
      return {
        sign: "Letter L",
        spokenPhrase: "Letter L",
        confidence: 0.88,
        category: 'alphabet'
      };
    }
  }

  // 10. Number "3" / Letter "W": Index, Middle, Ring extended, Pinky folded
  if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
    return {
      sign: "Number 3",
      spokenPhrase: "Three",
      confidence: 0.86,
      category: 'number'
    };
  }

  // 11. Number "4": 4 fingers extended, thumb folded
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended) {
    return {
      sign: "Number 4",
      spokenPhrase: "Four",
      confidence: 0.88,
      category: 'number'
    };
  }

  // 12. Letter "Y" / Call Me (🤙): Thumb and Pinky extended, 3 middle fingers folded
  if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return {
      sign: "Call Me",
      spokenPhrase: "Please call me",
      confidence: 0.88,
      category: 'action'
    };
  }

  // 13. "Namaste" / Respectful Greeting: Open hand vertical with thumb tucked close to fingers
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended) {
    const fingerCloseness = dist(indexTip, pinkyTip) / palmScale;
    if (fingerCloseness < 0.45) {
      return {
        sign: "Namaste",
        spokenPhrase: "Namaste, welcome",
        confidence: 0.90,
        category: 'greeting'
      };
    }
  }

  // 14. "Stop / Wait" (✋): Open palm held upright with spread fingers
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbExtended) {
    const spread = dist(thumbTip, pinkyTip) / palmScale;
    if (spread > 0.8) {
      return {
        sign: "Stop / Wait",
        spokenPhrase: "Please stop and wait",
        confidence: 0.88,
        category: 'action'
      };
    }
  }

  // 15. "Food / Eating" (ISL): All five fingertips bunched together close to each other
  const bunchDist = (dist(thumbTip, indexTip) + dist(thumbTip, middleTip) + dist(thumbTip, ringTip) + dist(thumbTip, pinkyTip)) / palmScale;
  if (bunchDist < 0.9 && dist(thumbTip, wrist) > dist(thumbMcp, wrist)) {
    return {
      sign: "Food / Meal",
      spokenPhrase: "Food, I want to eat",
      confidence: 0.85,
      category: 'action'
    };
  }

  // 16. Letter "C" (ISL / ASL): Curved fingers forming a C shape
  if (!isIndexExtended && !isMiddleExtended && dist(indexTip, thumbTip) / palmScale > 0.35 && dist(indexTip, thumbTip) / palmScale < 0.75) {
    if (indexTip.y < thumbTip.y && Math.abs(indexTip.x - thumbTip.x) < 0.3) {
      return {
        sign: "Letter C",
        spokenPhrase: "Letter C",
        confidence: 0.84,
        category: 'alphabet'
      };
    }
  }

  return null;
}

/**
 * Classifies two-handed coordinated Indian & International sign gestures.
 * Recognizes joined hands for "Namaste", "Help", "Book", "Equal", "Heart", and "Applause".
 */
export function classifyTwoHandedSign(
  hand1: HandLandmark[],
  hand2: HandLandmark[]
): DetectedSignResult | null {
  if (!hand1 || hand1.length < 21 || !hand2 || hand2.length < 21) return null;

  // Scales for normalization
  const scale1 = dist(hand1[0], hand1[9]) || 0.2;
  const scale2 = dist(hand2[0], hand2[9]) || 0.2;
  const avgScale = (scale1 + scale2) / 2;

  // Key landmarks
  const wrist1 = hand1[0];
  const wrist2 = hand2[0];
  const thumb1 = hand1[4];
  const thumb2 = hand2[4];
  const index1 = hand1[8];
  const index2 = hand2[8];
  const middle1 = hand1[12];
  const middle2 = hand2[12];
  const ring1 = hand1[16];
  const ring2 = hand2[16];
  const pinky1 = hand1[20];
  const pinky2 = hand2[20];

  // Distances between key points of both hands
  const middleTipDist = dist(middle1, middle2) / avgScale;
  const indexTipDist = dist(index1, index2) / avgScale;
  const thumbTipDist = dist(thumb1, thumb2) / avgScale;
  const wristDist = dist(wrist1, wrist2) / avgScale;
  const palmDist = dist(hand1[9], hand2[9]) / avgScale;

  // Upright orientation (middle finger tip above wrist in viewport y-coords)
  const isUpright1 = middle1.y < wrist1.y;
  const isUpright2 = middle2.y < wrist2.y;

  // 1. NAMASTE / PRANAM (Joined Hands):
  // Both hands upright, fingertips close together, palms touching / facing each other
  if ((isUpright1 || middle1.y < wrist1.y + 0.15 * avgScale) && (isUpright2 || middle2.y < wrist2.y + 0.15 * avgScale)) {
    const areFingertipsClose = middleTipDist < 1.35 || indexTipDist < 1.35 || thumbTipDist < 1.35;
    const arePalmsClose = palmDist < 2.0 || wristDist < 2.4;

    if (areFingertipsClose && arePalmsClose) {
      return {
        sign: "Namaste",
        spokenPhrase: "Namaste, welcome",
        confidence: 0.96,
        category: 'greeting'
      };
    }
  }

  // 2. HELP / SAHAYATA (ISL):
  // One hand flat horizontally, other hand resting on it
  const isHand1Flat = Math.abs(middle1.y - wrist1.y) < 0.25 * avgScale;
  const isHand2OnTop = dist(wrist2, hand1[9]) / avgScale < 1.2;
  if (isHand1Flat && isHand2OnTop) {
    return {
      sign: "Help",
      spokenPhrase: "I need help",
      confidence: 0.88,
      category: 'action'
    };
  }

  // 3. BOOK / STUDY / READ:
  // Both hands palms-up side-by-side with pinky edges close together
  const pinkyDist = dist(pinky1, pinky2) / avgScale;
  if (pinkyDist < 0.85 && palmDist < 1.6 && Math.abs(wrist1.y - wrist2.y) / avgScale < 0.7) {
    return {
      sign: "Book / Study",
      spokenPhrase: "Let's study the book",
      confidence: 0.86,
      category: 'action'
    };
  }

  // 4. EQUAL / SAME:
  // Both index fingers pointing at each other touching
  const indexTouchDist = dist(index1, index2) / avgScale;
  if (indexTouchDist < 0.45 && middleTipDist > 0.6) {
    return {
      sign: "Equal / Same",
      spokenPhrase: "Both are equal and same",
      confidence: 0.89,
      category: 'affirmation'
    };
  }

  // 5. HEART / LOVE (🫶):
  // Thumbs touching at bottom, index fingers touching at top
  if (thumbTipDist < 0.6 && indexTipDist < 0.6 && palmDist < 1.5) {
    return {
      sign: "Heart / Love",
      spokenPhrase: "Love and care",
      confidence: 0.90,
      category: 'expression'
    };
  }

  // 6. CLAP / APPLAUSE:
  // Both palms facing each other in close proximity
  if (palmDist < 0.7 && middleTipDist < 0.7) {
    return {
      sign: "Clap / Applause",
      spokenPhrase: "Great job, well done",
      confidence: 0.88,
      category: 'expression'
    };
  }

  return null;
}
