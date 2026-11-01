'use client';

import React, { useState, useMemo, ChangeEvent, useEffect } from 'react';
import { BookOpen, User, Calendar, RotateCcw, LogOut, Home } from 'lucide-react';

// --- TYPES ---

interface SystemMap {
  [key: string]: number;
}

interface Inputs {
  day: string;
  month: string;
  year: string;
  birthName: string;
  schoolName: string;
  currentName: string;
  houseNumber: string;
}

interface HistoryEntry {
  id: string;
  inputs: Inputs;
  createdAt: string;
}

interface ReportItem {
  id: number;
  name: string;
  val: number | number[] | string;
  desc: string;
}

interface TransitLetter {
  letter: string;
  value: number;
}

interface TransitYear {
  age: number;
  year: number;
  physical: TransitLetter | null;
  mental: TransitLetter | null;
  spiritual: TransitLetter | null;
  hiddenEssence: number;
  essence: number;
}

interface Milestone {
  step: number;
  letter: string;
  startYear: number;
  overtone: number;
  milestoneYear: number;
}

interface ExpressionComponent {
  name: string;
  count: number;
  strength: 'Strong' | 'Average' | 'Weak';
}

interface PsychomatrixLine {
  name: string;
  description: string;
  count: number;
}

interface BridgeNumber {
  name: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  value: number;
}

interface CalculationResult {
  items: ReportItem[];
  currentAge: number;
  highlightYear: number;
  transitYears: TransitYear[];
  energyCode: string;
  energyCodeTotal: number;
  energyCodeNumber: number;
  milestones: Milestone[];
  redLetterAges: { name: string; ages: number[] }[];
  overlappingAges: number[];
  significantAgeRuns: number[][];
  expressionComponents: ExpressionComponent[];
  psychomatrix: {
    workingNumbers: number[];
    digitString: string;
    counts: number[];
    lines: PsychomatrixLine[];
  };
  energyRealms: {
    letters: { letter: string; value: number; realm: string; attribute: string }[];
    realms: { name: string; total: number; reduced: number }[];
    attributes: { name: string; total: number; reduced: number }[];
  };
  bridges: BridgeNumber[];
  houseNumber: { input: string; total: number; number: number } | null;
}

interface NameParts {
  first: string;
  middle: string;
  last: string;
}

// --- CONSTANTS & DATA ---

// Pythagorean System: 1-9 (Sequential)
const PYTHAGOREAN: Record<number, string[]> = {
  1: ['A', 'J', 'S'],
  2: ['B', 'K', 'T'],
  3: ['C', 'L', 'U'],
  4: ['D', 'M', 'V'],
  5: ['E', 'N', 'W'],
  6: ['F', 'O', 'X'],
  7: ['G', 'P', 'Y'],
  8: ['H', 'Q', 'Z'],
  9: ['I', 'R']
};

// Chaldean System: 1-8 (Vibrational, No 9)
const CHALDEAN: Record<number, string[]> = {
  1: ['A', 'I', 'J', 'Q', 'Y'],
  2: ['B', 'K', 'R'],
  3: ['C', 'G', 'L', 'S'],
  4: ['D', 'M', 'T'],
  5: ['E', 'H', 'N', 'X'],
  6: ['U', 'V', 'W'],
  7: ['O', 'Z'],
  8: ['F', 'P']
};

const EXPRESSION_STYLES: Record<string, string> = {
  D: 'Physical', E: 'Physical', M: 'Physical', P: 'Physical', W: 'Physical',
  A: 'Mental', G: 'Mental', H: 'Mental', J: 'Mental', L: 'Mental', N: 'Mental', Q: 'Mental', V: 'Mental',
  B: 'Emotional', I: 'Emotional', O: 'Emotional', R: 'Emotional', S: 'Emotional', T: 'Emotional', X: 'Emotional', Z: 'Emotional',
  C: 'Intuitive', F: 'Intuitive', K: 'Intuitive', U: 'Intuitive', Y: 'Intuitive'
};

const ENERGY_REALMS: Record<string, { realm: string; attribute: string }> = {
  E: { realm: 'Action', attribute: 'Creative' },
  W: { realm: 'Action', attribute: 'Creative' },
  D: { realm: 'Action', attribute: 'Grounded' },
  M: { realm: 'Action', attribute: 'Grounded' },
  A: { realm: 'Intelligence', attribute: 'Creative' },
  H: { realm: 'Intelligence', attribute: 'Creative' },
  J: { realm: 'Intelligence', attribute: 'Creative' },
  N: { realm: 'Intelligence', attribute: 'Creative' },
  P: { realm: 'Intelligence', attribute: 'Creative' },
  G: { realm: 'Intelligence', attribute: 'Adaptability' },
  L: { realm: 'Intelligence', attribute: 'Adaptability' },
  I: { realm: 'Feelings', attribute: 'Creative' },
  O: { realm: 'Feelings', attribute: 'Creative' },
  R: { realm: 'Feelings', attribute: 'Creative' },
  Z: { realm: 'Feelings', attribute: 'Creative' },
  B: { realm: 'Feelings', attribute: 'Adaptability' },
  S: { realm: 'Feelings', attribute: 'Adaptability' },
  T: { realm: 'Feelings', attribute: 'Adaptability' },
  X: { realm: 'Feelings', attribute: 'Adaptability' },
  K: { realm: 'Higher Self', attribute: 'Creative' },
  F: { realm: 'Higher Self', attribute: 'Adaptability' },
  Q: { realm: 'Higher Self', attribute: 'Adaptability' },
  U: { realm: 'Higher Self', attribute: 'Adaptability' },
  Y: { realm: 'Higher Self', attribute: 'Adaptability' },
  C: { realm: 'Higher Self', attribute: 'Grounded' },
  V: { realm: 'Higher Self', attribute: 'Grounded' }
};

const VOWELS: string[] = ['A', 'E', 'I', 'O', 'U'];
const EXPRESSION_COMPONENT_NAMES = ['Physical', 'Mental', 'Emotional', 'Intuitive'];
const PSYCHOMATRIX_CELLS = [
  { number: 1, name: 'Character', description: 'Nature and willpower.' },
  { number: 2, name: 'Energy', description: 'Practical energy for daily life.' },
  { number: 3, name: 'Interests', description: 'Cognitive capacity and practical interests.' },
  { number: 4, name: 'Health', description: 'Birth potential for health and endurance.' },
  { number: 5, name: 'Logic', description: 'Intuition and logical thinking.' },
  { number: 6, name: 'Aptitude for Work', description: 'Inclination for physical work.' },
  { number: 7, name: 'Luck', description: 'Fortune and timely opportunities.' },
  { number: 8, name: 'Duty', description: 'Commitment and responsibility.' },
  { number: 9, name: 'Memory', description: 'Analysis through memory and experience.' }
];
const MONTHS: string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Descriptions extracted from PDF Pages 7-10
const DESCRIPTIONS: Record<string, string> = {
  perception: "Relates to your personal perception and the lens through which you view the world.",
  innerChild: "Highlights experiences from your childhood and patterns that influence you as an adult.",
  impression: "Reveals the first impression you make on others and how they perceive you.",
  heartsDesire: "Reflects your innermost desires, passions, and the hidden wishes of your heart.",
  soulGuidance: "Represents the essence of your soul and the inner guidance you can access.",
  contribution: "Shows how you can contribute to the world based on your life experiences.",
  power: "Reveals your future potential and ultimate life goal, influential in midlife.",
  karmicLessons: "Points to specific weaknesses or areas in life that you need to develop.",
  untappedPotential: "A positive view of Karmic Lessons, showing opportunities for growth.",
  directingModifier: "Directs and filters how you use the potential of your other core numbers.",
  foundation: "Lays the foundation for your personality and dictates your natural approach to life.",
  firstEmotional: "Gives insight into your initial emotional response to life events.",
  secretive: "Reveals your profound and hidden innermost goals, wishes, and beliefs.",
  finishing: "Reveals your style of completing projects and seeing them through.",
  destination: "Points to the final destination or the ultimate outcome of your efforts.",
  latentTalent: "Represents a hidden talent or skill you are passionate about.",
  innerFire: "Captures the essence of a secret, burning passion that fuels your desires.",
  copingStyle: "Reveals your natural way of coping with stress and challenges.",
  crisisResponse: "Describes how you instinctively react during a crisis.",
  mentalApproach: "Reveals your style of thinking and mental processes.",
  thoughtProcess: "Describes how your mind works through problems.",
  anchor: "Represents the stable, reliable part of your personality that keeps you grounded.",
  reliability: "Shows the dependable qualities within you that you can use to overcome obstacles."
};

// --- HELPER FUNCTIONS ---

const createMap = (system: Record<number, string[]>): SystemMap => {
  const map: SystemMap = {};
  Object.entries(system).forEach(([num, letters]) => {
    letters.forEach(char => map[char] = parseInt(num));
  });
  return map;
};

const PYTH_MAP = createMap(PYTHAGOREAN);
const CHAL_MAP = createMap(CHALDEAN);

const cleanString = (str: string): string => str.toUpperCase().replace(/[^A-Z]/g, '');
const cleanStringWithSpaces = (str: string): string => str.toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
const getCharValue = (char: string, systemMap: SystemMap): number => systemMap[char] || 0;

// Reduction logic (PDF Page 4): Master Numbers (11, 22) are not reduced.
// Added 33 as standard practice.
const reduceNumber = (num: number): number => {
  if (num === 0) return 0;
  let n = num;
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  }
  return n;
};

const formatNumber = (num: number | number[] | string): string => {
  if (Array.isArray(num)) return num.join(', ');
  if (num === 11) return "11/2";
  if (num === 22) return "22/4";
  if (num === 33) return "33/6";
  return num.toString();
};

const isVowel = (char: string): boolean => VOWELS.includes(char);

const reduceToSingleDigit = (num: number): number => {
  let value = Math.abs(num);
  while (value > 9) {
    value = String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return value;
};

const getNameParts = (name: string): NameParts => {
  const parts = cleanStringWithSpaces(name).split(' ').filter(Boolean);
  if (parts.length === 0) return { first: '', middle: '', last: '' };
  if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
  return {
    first: parts[0],
    middle: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    last: parts[parts.length - 1],
  };
};

const getActiveTransitLetter = (name: string, age: number): TransitLetter | null => {
  const letters = cleanString(name).split('');
  if (letters.length === 0) return null;

  const values = letters.map(letter => getCharValue(letter, PYTH_MAP));
  const cycleLength = values.reduce((sum, value) => sum + value, 0);
  if (cycleLength === 0) return null;

  let position = age % cycleLength;
  for (let index = 0; index < letters.length; index++) {
    if (position < values[index]) {
      return { letter: letters[index], value: values[index] };
    }
    position -= values[index];
  }
  return null;
};

const getCurrentAge = (day: number, month: number, year: number, today = new Date()): number => {
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }
  return age;
};

// --- MAIN COMPONENT ---

export default function NumeroScope() {
  const [inputs, setInputs] = useState<Inputs>({
    day: '', month: '', year: '', birthName: '', schoolName: '', currentName: '', houseNumber: ''
  });
  const [showReport, setShowReport] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyStatus, setHistoryStatus] = useState<string>('');

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) throw new Error('Unable to load saved reports');
      const data = await response.json();
      setHistory(data.history);
    } catch {
      setHistoryStatus('Saved history is temporarily unavailable.');
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // --- CALCULATION LOGIC ---
  const calculate = useMemo<CalculationResult | null>(() => {
    if (!inputs.day || !inputs.month || !inputs.year || !inputs.birthName || !inputs.currentName || !inputs.schoolName) return null;

    const dayRaw = Number(inputs.day);
    const monthRaw = Number(inputs.month);
    const yearRaw = Number(inputs.year);

    if (![dayRaw, monthRaw, yearRaw].every(Number.isInteger)) return null;
    const today = new Date();
    const birthDate = new Date(yearRaw, monthRaw - 1, dayRaw);
    if (
      dayRaw < 1 ||
      dayRaw > 31 ||
      monthRaw < 1 ||
      monthRaw > 12 ||
      yearRaw < 1000 ||
      yearRaw > today.getFullYear() ||
      birthDate.getFullYear() !== yearRaw ||
      birthDate.getMonth() !== monthRaw - 1 ||
      birthDate.getDate() !== dayRaw
    ) return null;

    const birthNameClean = cleanStringWithSpaces(inputs.birthName);
    const schoolNameClean = cleanStringWithSpaces(inputs.schoolName);
    const currentNameClean = cleanStringWithSpaces(inputs.currentName);
    if (!birthNameClean || !schoolNameClean || !currentNameClean) return null;
    
    const birthNameParts = getNameParts(birthNameClean);
    const currentNameParts = getNameParts(currentNameClean);
    const firstNameBirth = birthNameParts.first;
    const lastNameBirth = birthNameParts.last;
    const firstNameCurrent = currentNameParts.first;
    const lastNameCurrent = currentNameParts.last;

    // Core variables use the birth date's summed digits.
    const dayNumber = reduceNumber(dayRaw);
    const lifePath = reduceNumber(dayRaw + monthRaw + yearRaw);

    const calculateSum = (text: string, systemMap: SystemMap, filter: 'all' | 'vowel' | 'consonant' = 'all'): number => {
      const clean = cleanString(text);
      let sum = 0;
      for (const char of clean) {
        if (filter === 'vowel' && !isVowel(char)) continue;
        if (filter === 'consonant' && isVowel(char)) continue;
        sum += getCharValue(char, systemMap);
      }
      return sum;
    };

    const getMode = (text: string, systemMap: SystemMap): number[] => {
        const clean = cleanString(text);
        const counts: Record<number, number> = {};
        let maxCount = 0;
        
        for (const char of clean) {
            const val = getCharValue(char, systemMap);
            if(val === 0) continue;
            counts[val] = (counts[val] || 0) + 1;
            if (counts[val] > maxCount) maxCount = counts[val];
        }
        
        const modes = Object.keys(counts)
            .filter(k => counts[parseInt(k)] === maxCount)
            .map(Number)
            .sort((a,b) => a-b);
            
        return modes.length > 0 ? modes : [0];
    };

    const getMissing = (text: string, systemMap: SystemMap, maxVal: number): (number | string)[] => {
        const clean = cleanString(text);
        const present = new Set<number>();
        for (const char of clean) {
            present.add(getCharValue(char, systemMap));
        }
        const missing: number[] = [];
        for (let i = 1; i <= maxVal; i++) {
            if (!present.has(i)) missing.push(i);
        }
        return missing.length > 0 ? missing : ["None"];
    };

    const getInitialsSum = (textWithSpaces: string, systemMap: SystemMap): number => {
        const parts = textWithSpaces.split(' ');
        let sum = 0;
        parts.forEach(p => { if (p.length > 0) sum += getCharValue(p[0], systemMap); });
        return sum;
    };
    
    // --- REPORT ITEM CALCULATIONS (Based on PDF Rules) ---
    
    // 1. Perception (Page 7): Sum of birth day and birth month -> Reduced
    const perception = reduceNumber(dayRaw + monthRaw);
    
    // 2. Inner Child (Page 7): Sum of consonants in Birth Name (Pyth) -> Reduced
    const innerChild = reduceNumber(calculateSum(birthNameClean, PYTH_MAP, 'consonant'));
    
    // 3. Impression (Page 7): Sum of consonants in Current Name (Chal) -> Reduced
    const impression = reduceNumber(calculateSum(currentNameClean, CHAL_MAP, 'consonant'));
    
    // 4. Heart's Desire (Page 7): Sum of vowels in Birth Name (Pyth) -> Reduced
    const heartsDesire = reduceNumber(calculateSum(birthNameClean, PYTH_MAP, 'vowel'));
    
    // 5. Soul Inner Guidance (Page 7): Sum of vowels in Current Name (Chal) -> Reduced
    const soulGuidance = reduceNumber(calculateSum(currentNameClean, CHAL_MAP, 'vowel'));
    
    // 6. Contribution (Page 7): Life Path + long-used Name (Pyth) -> Reduced
    const currentNameSumPyth = reduceNumber(calculateSum(currentNameClean, PYTH_MAP));
    const contribution = reduceNumber(lifePath + currentNameSumPyth);
    
    // 7. Power (Page 8): Life Path + CURRENT Name (Chal) -> Reduced
    const currentNameSumChal = reduceNumber(calculateSum(currentNameClean, CHAL_MAP));
    const power = reduceNumber(lifePath + currentNameSumChal);
    
    // 8-9. Missing Numbers (Arrays)
    const karmicLessons = getMissing(birthNameClean, PYTH_MAP, 9);
    const untappedPotential = getMissing(schoolNameClean, CHAL_MAP, 8);
    
    // 10. Directing Modifier (Page 8): First Letter of Birth First Name -> Reduced
    const directingModifier = firstNameBirth ? reduceNumber(getCharValue(firstNameBirth[0], PYTH_MAP)) : 0;
    
    // 11. Foundation (Page 8): First Letter of Current First Name -> Reduced
    const foundation = firstNameCurrent ? reduceNumber(getCharValue(firstNameCurrent[0], CHAL_MAP)) : 0;
    
    // 12. First Emotional (Page 8): First Vowel of Birth First Name -> Reduced
    const getFirstVowelVal = (name: string, map: SystemMap): number => {
        const match = name.split('').find(c => isVowel(c));
        return match ? getCharValue(match, map) : 0;
    };
    const firstEmotional = reduceNumber(getFirstVowelVal(firstNameBirth, PYTH_MAP));
    
    // 13. Secretive (Page 9): First Vowel of Current First Name -> Reduced
    const secretive = reduceNumber(getFirstVowelVal(firstNameCurrent, CHAL_MAP));
    
    // 14. Finishing (Page 9): Last Letter of Birth Last Name -> Reduced
    const finishing = lastNameBirth ? reduceNumber(getCharValue(lastNameBirth[lastNameBirth.length - 1], PYTH_MAP)) : 0;
    
    // 15. Destination (Page 9): Last Letter of Current Last Name -> Reduced
    const destination = lastNameCurrent ? reduceNumber(getCharValue(lastNameCurrent[lastNameCurrent.length - 1], CHAL_MAP)) : 0;
    
    // 16. Latent Talent (Page 9): Mode of Birth Name
    const latentTalent = getMode(birthNameClean, PYTH_MAP);
    
    // 17. Inner Fire (Page 9): Mode of Current Name
    const innerFire = getMode(currentNameClean, CHAL_MAP);
    
    // 18. Coping Style (Page 9): Sum of initials of Birth Name -> Reduced
    const copingStyle = reduceNumber(getInitialsSum(birthNameClean, PYTH_MAP));
    
    // 19. Crisis Response (Page 10): Sum of initials of Current Name -> Reduced
    const crisisResponse = reduceNumber(getInitialsSum(currentNameClean, CHAL_MAP));
    
    // 20. Mental Approach (Page 10): Value of First Name (Pyth) + Value of Day -> Reduced
    // PDF implies "Value" = Reduced Sum.
    const mentalApproach = reduceNumber(reduceNumber(calculateSum(firstNameBirth, PYTH_MAP)) + dayNumber);

    // 21. Thought Process (Page 10): Value of First Name (Chal) + Value of Day -> Reduced
    const thoughtProcess = reduceNumber(reduceNumber(calculateSum(firstNameCurrent, CHAL_MAP)) + dayNumber);
    
    // 22. Anchor Number (Page 10): Count of letters in Birth Name -> Reduced
    const anchor = reduceNumber(cleanString(birthNameClean).length);

    // 23. Reliability Number (Page 10): Count of letters in Current Name -> Reduced
    const reliability = reduceNumber(cleanString(currentNameClean).length);

    const items: ReportItem[] = [
      { id: 1, name: "Perception Number", val: perception, desc: DESCRIPTIONS.perception },
      { id: 2, name: "Inner Child Number", val: innerChild, desc: DESCRIPTIONS.innerChild },
      { id: 3, name: "Impression Number", val: impression, desc: DESCRIPTIONS.impression },
      { id: 4, name: "Heart's Desire Number", val: heartsDesire, desc: DESCRIPTIONS.heartsDesire },
      { id: 5, name: "Soul Inner Guidance", val: soulGuidance, desc: DESCRIPTIONS.soulGuidance },
      { id: 6, name: "Contribution Number", val: contribution, desc: DESCRIPTIONS.contribution },
      { id: 7, name: "Power Number", val: power, desc: DESCRIPTIONS.power },
      { id: 8, name: "Karmic Lesson Numbers", val: karmicLessons as number[], desc: DESCRIPTIONS.karmicLessons },
      { id: 9, name: "Untapped Potential", val: untappedPotential as number[], desc: DESCRIPTIONS.untappedPotential },
      { id: 10, name: "Directing Modifier", val: directingModifier, desc: DESCRIPTIONS.directingModifier },
      { id: 11, name: "Foundation Number", val: foundation, desc: DESCRIPTIONS.foundation },
      { id: 12, name: "First Emotional Reaction", val: firstEmotional, desc: DESCRIPTIONS.firstEmotional },
      { id: 13, name: "Secretive Number", val: secretive, desc: DESCRIPTIONS.secretive },
      { id: 14, name: "Finishing Number", val: finishing, desc: DESCRIPTIONS.finishing },
      { id: 15, name: "Destination Number", val: destination, desc: DESCRIPTIONS.destination },
      { id: 16, name: "Latent Talent Number", val: latentTalent, desc: DESCRIPTIONS.latentTalent },
      { id: 17, name: "Inner Fire Number", val: innerFire, desc: DESCRIPTIONS.innerFire },
      { id: 18, name: "Coping Style Number", val: copingStyle, desc: DESCRIPTIONS.copingStyle },
      { id: 19, name: "Crisis Response Number", val: crisisResponse, desc: DESCRIPTIONS.crisisResponse },
      { id: 20, name: "Mental Approach Number", val: mentalApproach, desc: DESCRIPTIONS.mentalApproach },
      { id: 21, name: "Thought Process Number", val: thoughtProcess, desc: DESCRIPTIONS.thoughtProcess },
      { id: 22, name: "Anchor Number", val: anchor, desc: DESCRIPTIONS.anchor },
      { id: 23, name: "Reliability Number", val: reliability, desc: DESCRIPTIONS.reliability },
      { id: 24, name: "Life Path Number", val: lifePath, desc: "Your birth-date digits reduced to your core life-path number." },
      { id: 25, name: "Birthday Number", val: dayNumber, desc: "Your birth day reduced to its core number; used as the Soul Gift in bridge calculations." },
    ];

    const currentAge = getCurrentAge(dayRaw, monthRaw, yearRaw, today);
    const transitYears: TransitYear[] = Array.from({ length: 101 }, (_, age) => {
      const physical = getActiveTransitLetter(birthNameParts.first, age);
      const mental = getActiveTransitLetter(birthNameParts.middle, age);
      const spiritual = getActiveTransitLetter(birthNameParts.last, age);
      const hiddenEssence = (physical?.value ?? 0) + (mental?.value ?? 0) + (spiritual?.value ?? 0);
      return {
        age,
        year: yearRaw + age,
        physical,
        mental,
        spiritual,
        hiddenEssence,
        essence: hiddenEssence === 11 || hiddenEssence === 22
          ? hiddenEssence
          : reduceToSingleDigit(hiddenEssence),
      };
    });

    const currentLetters = [
      getActiveTransitLetter(currentNameParts.first, currentAge),
      getActiveTransitLetter(currentNameParts.middle, currentAge),
      getActiveTransitLetter(currentNameParts.last, currentAge),
    ].filter((letter): letter is TransitLetter => letter !== null);
    const energyCodeTotal = currentLetters.reduce((sum, letter) => sum + letter.value, 0);

    const birthLetters = cleanString(birthNameClean);
    const milestones: Milestone[] = [];
    let startingYear = yearRaw;
    for (let index = 0; index < birthLetters.length; index++) {
      const overtone = reduceToSingleDigit(
        String(startingYear).split('').reduce((sum, digit) => sum + Number(digit), 0)
      );
      const milestoneYear = startingYear + overtone;
      milestones.push({
        step: index + 1,
        letter: birthLetters[index],
        startYear: startingYear,
        overtone,
        milestoneYear,
      });
      startingYear = milestoneYear;
    }

    const nameSegments = [
      { name: 'First name', value: birthNameParts.first },
      { name: 'Middle name', value: birthNameParts.middle },
      { name: 'Last name', value: birthNameParts.last },
    ].filter(segment => segment.value.length > 0);
    const redLetterAges = nameSegments.map(segment => {
      const values = cleanString(segment.value).split('').map(letter => getCharValue(letter, PYTH_MAP));
      const ages: number[] = [];
      let total = 0;
      let index = 0;
      while (values.length > 0 && total + values[index % values.length] <= 100) {
        total += values[index % values.length];
        ages.push(total);
        index++;
      }
      return { name: segment.name, ages };
    });
    const agesByName = new Map<number, number>();
    for (const segment of redLetterAges) {
      for (const age of segment.ages) {
        agesByName.set(age, (agesByName.get(age) ?? 0) + 1);
      }
    }
    const overlappingAges = [...agesByName.entries()]
      .filter(([, count]) => count > 1)
      .map(([age]) => age)
      .sort((a, b) => a - b);
    const markedAges = [...agesByName.keys()].sort((a, b) => a - b);
    const significantAgeRuns: number[][] = [];
    let ageRun: number[] = [];
    for (const age of markedAges) {
      if (ageRun.length > 0 && age !== ageRun[ageRun.length - 1] + 1) {
        if (ageRun.length > 1) significantAgeRuns.push(ageRun);
        ageRun = [];
      }
      ageRun.push(age);
    }
    if (ageRun.length > 1) significantAgeRuns.push(ageRun);

    const expressionCounts = Object.fromEntries(
      EXPRESSION_COMPONENT_NAMES.map(name => [name, 0])
    ) as Record<string, number>;
    for (const letter of birthLetters) {
      const style = EXPRESSION_STYLES[letter];
      expressionCounts[style]++;
    }
    const largestExpressionCount = Math.max(...Object.values(expressionCounts));
    const expressionComponents: ExpressionComponent[] = EXPRESSION_COMPONENT_NAMES.map(name => {
      const count = expressionCounts[name];
      const strength = count >= largestExpressionCount * 0.6
        ? 'Strong'
        : count < largestExpressionCount * 0.25
          ? 'Weak'
          : 'Average';
      return { name, count, strength };
    });

    const dateDigits = `${dayRaw}${monthRaw}${yearRaw}`;
    const firstWorkingNumber = [...dateDigits].reduce((sum, digit) => sum + Number(digit), 0);
    const secondWorkingNumber = reduceToSingleDigit(firstWorkingNumber);
    const thirdWorkingNumber = firstWorkingNumber - 2 * Number(dateDigits[0]);
    const fourthWorkingNumber = reduceToSingleDigit(thirdWorkingNumber);
    const workingNumbers = [
      firstWorkingNumber,
      secondWorkingNumber,
      thirdWorkingNumber,
      fourthWorkingNumber,
    ];
    const digitString = `${dateDigits}${workingNumbers.join('')}`;
    const counts = Array.from({ length: 10 }, (_, digit) =>
      digit === 0 ? 0 : [...digitString].filter(char => Number(char) === digit).length
    );
    const psychomatrixLines: PsychomatrixLine[] = [
      { name: 'Sense of Purpose', description: 'Desires balanced with capabilities (1, 4, 7).', count: counts[1] + counts[4] + counts[7] },
      { name: 'Aptitude for Family', description: 'Interest in close relationships (2, 5, 8).', count: counts[2] + counts[5] + counts[8] },
      { name: 'Stability', description: 'Habits balanced with openness to change (3, 6, 9).', count: counts[3] + counts[6] + counts[9] },
      { name: 'Self-Esteem', description: 'Confidence in realizing potential (1, 2, 3).', count: counts[1] + counts[2] + counts[3] },
      { name: 'Working Efficiency', description: 'Capacity for work and material welfare (4, 5, 6).', count: counts[4] + counts[5] + counts[6] },
      { name: 'Talent', description: 'Potential talents (7, 8, 9).', count: counts[7] + counts[8] + counts[9] },
      { name: 'Spirituality', description: 'Unity of beliefs and perception (1, 5, 9).', count: counts[1] + counts[5] + counts[9] },
      { name: 'Temperament', description: 'Temperament and intimate relationships (3, 5, 7).', count: counts[3] + counts[5] + counts[7] },
    ];

    const energyLetters = birthLetters.split('').map(letter => ({
      letter,
      value: getCharValue(letter, PYTH_MAP),
      ...ENERGY_REALMS[letter],
    }));
    const realms = ['Action', 'Intelligence', 'Feelings', 'Higher Self'].map(name => {
      const total = energyLetters
        .filter(letter => letter.realm === name)
        .reduce((sum, letter) => sum + letter.value, 0);
      return { name, total, reduced: reduceNumber(total) };
    });
    const attributes = ['Creative', 'Adaptability', 'Grounded'].map(name => {
      const total = energyLetters
        .filter(letter => letter.attribute === name)
        .reduce((sum, letter) => sum + letter.value, 0);
      return { name, total, reduced: reduceNumber(total) };
    });

    const birthSoulGuidance = reduceNumber(calculateSum(birthNameClean, CHAL_MAP, 'vowel'));
    const birthImpression = reduceNumber(calculateSum(birthNameClean, CHAL_MAP, 'consonant'));
    const pythagoreanExpression = reduceNumber(heartsDesire + innerChild);
    const chaldeanExpression = reduceNumber(calculateSum(birthNameClean, CHAL_MAP));
    const bridges: BridgeNumber[] = [
      { name: 'Life Path / Soul Gift', leftLabel: 'Life Path', leftValue: lifePath, rightLabel: 'Birthday', rightValue: dayNumber, value: Math.abs(lifePath - dayNumber) },
      { name: 'Life Path / Pythagorean Expression', leftLabel: 'Life Path', leftValue: lifePath, rightLabel: 'Pythagorean Expression', rightValue: pythagoreanExpression, value: Math.abs(lifePath - pythagoreanExpression) },
      { name: "Heart's Desire / Inner Child", leftLabel: "Heart's Desire", leftValue: heartsDesire, rightLabel: 'Inner Child', rightValue: innerChild, value: Math.abs(heartsDesire - innerChild) },
      { name: "Heart's Desire / Pythagorean Expression", leftLabel: "Heart's Desire", leftValue: heartsDesire, rightLabel: 'Pythagorean Expression', rightValue: pythagoreanExpression, value: Math.abs(heartsDesire - pythagoreanExpression) },
      { name: 'Life Path / Chaldean Expression', leftLabel: 'Life Path', leftValue: lifePath, rightLabel: 'Chaldean Expression', rightValue: chaldeanExpression, value: Math.abs(lifePath - chaldeanExpression) },
      { name: 'Soul Guidance / Impression', leftLabel: 'Soul Guidance', leftValue: birthSoulGuidance, rightLabel: 'Impression', rightValue: birthImpression, value: Math.abs(birthSoulGuidance - birthImpression) },
      { name: 'Soul Guidance / Chaldean Expression', leftLabel: 'Soul Guidance', leftValue: birthSoulGuidance, rightLabel: 'Chaldean Expression', rightValue: chaldeanExpression, value: Math.abs(birthSoulGuidance - chaldeanExpression) },
    ];

    const houseCharacters = inputs.houseNumber.toUpperCase().match(/[A-Z0-9]/g) ?? [];
    const houseTotal = houseCharacters.reduce((sum, char) =>
      sum + (/\d/.test(char) ? Number(char) : getCharValue(char, PYTH_MAP)), 0
    );
    const houseNumber = houseCharacters.length > 0
      ? { input: inputs.houseNumber, total: houseTotal, number: reduceToSingleDigit(houseTotal) }
      : null;

    return {
      items,
      currentAge,
      highlightYear: reduceToSingleDigit(currentAge + currentAge + 1),
      transitYears,
      energyCode: currentLetters.map(letter => letter.letter).join(''),
      energyCodeTotal,
      energyCodeNumber: reduceNumber(energyCodeTotal),
      milestones,
      redLetterAges,
      overlappingAges,
      significantAgeRuns,
      expressionComponents,
      psychomatrix: { workingNumbers, digitString, counts, lines: psychomatrixLines },
      energyRealms: { letters: energyLetters, realms, attributes },
      bridges,
      houseNumber,
    };
  }, [inputs]);

  const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed');
            }
        } catch {
            alert('An error occurred during logout');
        }
    }

  const submitReport = async () => {
    if (!calculate) {
      alert('Please fill all fields correctly');
      return;
    }

    setShowReport(true);
    setHistoryStatus('Saving report…');

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, result: calculate }),
      });
      if (!response.ok) throw new Error('Unable to save report');
      setHistoryStatus('Saved to history.');
      await loadHistory();
    } catch {
      setHistoryStatus('Report shown, but it could not be saved to history.');
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-purple-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 p-6 border-b shadow-lg bg-white/80 backdrop-blur-md border-slate-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-500 via-teal-500 to-amber-500 bg-clip-text">
              NumeroScope
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => { setInputs({ day: '', month: '', year: '', birthName: '', schoolName: '', currentName: '', houseNumber: '' }); setShowReport(false); }}
                className="flex items-center gap-2 transition-colors text-slate-500 hover:text-slate-900"
            >
                <RotateCcw size={16} />
                <span className="text-sm font-medium">Reset</span>
            </button>
            <div className="w-px h-6 bg-slate-300"></div>
            <button 
                onClick={() => handleLogout() }
                className="flex items-center gap-2 font-medium transition-colors text-red-600 hover:text-red-700"
            >
                <LogOut size={16} />
                <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl p-6 mx-auto">
        
        {/* Input Form */}
        <section className={`transition-all duration-500 ease-in-out ${showReport ? 'mb-8 opacity-100' : 'min-h-[60vh] flex items-center justify-center opacity-100'}`}>
          <div className={`w-full ${showReport ? 'bg-white/50 p-6 rounded-xl border border-slate-200' : 'max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-200'}`}>
            
            <div className={`grid gap-6 ${showReport ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1'}`}>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-teal-600">
                  <Calendar size={16} /> Date of Birth
                </label>
                <div className="flex gap-2">
                  <input type="number" name="day" placeholder="Day" min={1} max={31} value={inputs.day} onChange={handleInputChange} className="w-1/4 px-3 py-3 text-center transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
                  <select name="month" value={inputs.month} onChange={handleInputChange} className="w-2/4 px-3 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500">
                    <option value="" disabled>Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <input type="number" name="year" placeholder="Year" min={1900} max={2100} value={inputs.year} onChange={handleInputChange} className="w-1/4 px-3 py-3 text-center transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-purple-600"><User size={16} /> Birth Name</label>
                <input type="text" name="birthName" placeholder="Full Birth Certificate Name" value={inputs.birthName} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-amber-600"><BookOpen size={16} /> Childhood Name</label>
                <input type="text" name="schoolName" placeholder="Name from Childhood" value={inputs.schoolName} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-indigo-600"><User size={16} /> Most Used Name</label>
                <input type="text" name="currentName" placeholder="Name known for longer" value={inputs.currentName} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-600"><Home size={16} /> House / Unit (Optional)</label>
                <input type="text" name="houseNumber" placeholder="e.g. 17F" value={inputs.houseNumber} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="text-sm font-semibold text-slate-700">Recent reports</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => { setInputs(entry.inputs); setShowReport(true); }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-purple-400 hover:bg-purple-50"
                    >
                      <span className="block font-medium text-slate-800">{entry.inputs.birthName}</span>
                      <span className="block text-xs text-slate-500">{entry.inputs.day}/{entry.inputs.month}/{entry.inputs.year} · {new Date(entry.createdAt).toLocaleDateString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {historyStatus && <p className="mt-4 text-sm text-slate-500" role="status">{historyStatus}</p>}

            {!showReport && (
              <button onClick={submitReport} disabled={!calculate} className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Submit
              </button>
            )}
          </div>
        </section>

        {showReport && calculate && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {calculate.items.map((item) => (
                <div key={item.id} className="relative flex flex-col justify-between p-5 transition-all duration-300 bg-white border shadow-sm group border-slate-200 hover:border-purple-500/50 rounded-xl hover:shadow-xl hover:shadow-purple-900/10">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xs font-bold tracking-wider uppercase text-teal-600">{item.name}</h4>
                      <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                    </div>
                    <p className="mb-4 text-sm font-medium leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-end pt-4 mt-2 border-t border-slate-100">
                    <div className="text-3xl font-light font-mono bg-slate-50 text-slate-900 px-4 py-1 rounded-lg border border-slate-200 shadow-inner min-w-[3rem] text-center group-hover:border-purple-500/30 group-hover:text-purple-600 transition-colors">
                      {formatNumber(item.val)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-14 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Annual Cycles & Current Phase</h2>
                <p className="mt-1 text-sm text-slate-500">Name transits use the Pythagorean values and the birth-name segments.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-600">Current age</p>
                  <p className="mt-2 text-3xl font-light">{calculate.currentAge}</p>
                  <p className="mt-1 text-sm text-slate-500">Age on the current date</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Highlight year</p>
                  <p className="mt-2 text-3xl font-light">{calculate.highlightYear}</p>
                  <p className="mt-1 text-sm text-slate-500">For ages {calculate.currentAge} to {calculate.currentAge + 1}</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Current energy code</p>
                  <p className="mt-2 text-3xl font-light">
                    {calculate.energyCode || '—'}
                    <span className="ml-2 text-xl text-slate-500">
                      {calculate.energyCodeTotal === calculate.energyCodeNumber
                        ? formatNumber(calculate.energyCodeNumber)
                        : `${calculate.energyCodeTotal}/${calculate.energyCodeNumber}`}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Age {calculate.currentAge}; based on the most-used name</p>
                </article>
              </div>

              <details className="rounded-xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer font-semibold text-slate-800">Essence number timeline (birth to age 100)</summary>
                <p className="mt-3 text-sm text-slate-500">
                  Each letter remains active for its Pythagorean value in years. The hidden essence is the sum of active first, middle, and last-name letters; 11 and 22 remain master numbers.
                </p>
                <div className="mt-4 max-h-[28rem] overflow-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">Age</th>
                        <th className="px-3 py-2">Physical</th>
                        <th className="px-3 py-2">Mental</th>
                        <th className="px-3 py-2">Spiritual</th>
                        <th className="px-3 py-2">Hidden essence</th>
                        <th className="px-3 py-2">Essence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculate.transitYears.map(row => (
                        <tr key={row.age} className={row.age === calculate.currentAge ? 'bg-purple-50 font-semibold' : 'border-t border-slate-100'}>
                          <td className="px-3 py-2">{row.year}</td>
                          <td className="px-3 py-2">{row.age}</td>
                          <td className="px-3 py-2">{row.physical ? `${row.physical.value} (${row.physical.letter})` : '—'}</td>
                          <td className="px-3 py-2">{row.mental ? `${row.mental.value} (${row.mental.letter})` : '—'}</td>
                          <td className="px-3 py-2">{row.spiritual ? `${row.spiritual.value} (${row.spiritual.letter})` : '—'}</td>
                          <td className="px-3 py-2">{row.hiddenEssence}</td>
                          <td className="px-3 py-2">{formatNumber(row.essence)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!getNameParts(inputs.birthName).middle && (
                  <p className="mt-3 text-sm text-slate-500">No middle name was entered; its transit is left blank.</p>
                )}
              </details>

              <div className="grid gap-5 lg:grid-cols-2">
                <details className="rounded-xl border border-slate-200 bg-white p-5">
                  <summary className="cursor-pointer font-semibold text-slate-800">Milestone years & overtones</summary>
                  <p className="mt-3 text-sm text-slate-500">The birth year advances by its reduced digit sum once for every letter in the birth name.</p>
                  <div className="mt-4 max-h-80 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-600">
                        <tr><th className="px-2 py-2">Step</th><th className="px-2 py-2">Letter</th><th className="px-2 py-2">Starting year</th><th className="px-2 py-2">Overtone</th><th className="px-2 py-2">Milestone year</th></tr>
                      </thead>
                      <tbody>
                        {calculate.milestones.map(row => (
                          <tr key={row.step} className="border-t border-slate-100">
                            <td className="px-2 py-2">{row.step}</td><td className="px-2 py-2">{row.letter}</td>
                            <td className="px-2 py-2">{row.startYear}</td><td className="px-2 py-2">{row.overtone}</td><td className="px-2 py-2">{row.milestoneYear}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>

                <details className="rounded-xl border border-slate-200 bg-white p-5">
                  <summary className="cursor-pointer font-semibold text-slate-800">Red-letter ages</summary>
                  <p className="mt-3 text-sm text-slate-500">Cumulative letter values repeat through age 100; ages appearing in multiple name parts are highlighted.</p>
                  <div className="mt-4 space-y-3">
                    {calculate.redLetterAges.map(segment => (
                      <div key={segment.name}>
                        <h3 className="text-sm font-semibold text-slate-700">{segment.name}</h3>
                        <p className="text-sm leading-6 text-slate-600">{segment.ages.join(', ')}</p>
                      </div>
                    ))}
                    <div className="border-t border-slate-100 pt-3">
                      <h3 className="text-sm font-semibold text-purple-700">Ages repeated across name parts</h3>
                      <p className="text-sm leading-6 text-slate-600">{calculate.overlappingAges.length ? calculate.overlappingAges.join(', ') : 'None'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">Consecutive age runs</h3>
                      <p className="text-sm leading-6 text-slate-600">
                        {calculate.significantAgeRuns.length
                          ? calculate.significantAgeRuns.map(run => `${run[0]}-${run[run.length - 1]}`).join(', ')
                          : 'None'}
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            </section>

            <section className="mt-14 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Name Patterns</h2>
                <p className="mt-1 text-sm text-slate-500">These profiles use the full birth name and the letter classifications in the organizer.</p>
              </div>
              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold">Expression style</h3>
                <p className="mt-1 text-sm text-slate-500">Strength is classified against the largest component: Strong at 60% or more, Weak below 25%, otherwise Average.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {calculate.expressionComponents.map(component => (
                    <div key={component.name} className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">{component.name}</p>
                      <p className="mt-1 text-2xl font-light">{component.count}</p>
                      <p className="text-sm text-purple-700">{component.strength}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold">Energy Realms</h3>
                <p className="mt-1 text-sm text-slate-500">Each birth-name letter is grouped by realm and attribute; totals show the Pythagorean sum and its reduced value.</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                      <tr><th className="px-3 py-2">Realm</th><th className="px-3 py-2">Creative</th><th className="px-3 py-2">Adaptability</th><th className="px-3 py-2">Grounded</th><th className="px-3 py-2">Realm total</th></tr>
                    </thead>
                    <tbody>
                      {calculate.energyRealms.realms.map(realm => (
                        <tr key={realm.name} className="border-t border-slate-100">
                          <th className="px-3 py-3 font-semibold">{realm.name}</th>
                          {['Creative', 'Adaptability', 'Grounded'].map(attribute => {
                            const letters = calculate.energyRealms.letters.filter(letter => letter.realm === realm.name && letter.attribute === attribute);
                            const total = letters.reduce((sum, letter) => sum + letter.value, 0);
                            return (
                              <td key={attribute} className="px-3 py-3">
                                <span className="block text-slate-700">{letters.map(letter => letter.letter).join(', ') || '—'}</span>
                                <span className="text-xs text-slate-500">{total} / {formatNumber(reduceNumber(total))}</span>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 font-medium">{realm.total} / {formatNumber(realm.reduced)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {calculate.energyRealms.attributes.map(attribute => (
                    <span key={attribute.name} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {attribute.name}: {attribute.total} / {formatNumber(attribute.reduced)}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {calculate.energyRealms.letters.map((letter, index) => (
                    <span key={`${letter.letter}-${index}`} title={`${letter.realm} / ${letter.attribute}`} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
                      {letter.letter} ({letter.value})
                    </span>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-14 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Pythagorean Square (Psychomatrix)</h2>
                <p className="mt-1 text-sm text-slate-500">Working numbers: {calculate.psychomatrix.workingNumbers.join(', ')}. Final digit string: {calculate.psychomatrix.digitString}</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 4, 7, 2, 5, 8, 3, 6, 9].map(number => {
                    const cell = PSYCHOMATRIX_CELLS[number - 1];
                    const count = calculate.psychomatrix.counts[number];
                    return (
                      <article key={number} className="min-h-32 rounded-xl border border-slate-200 bg-white p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{cell.name}</p>
                        <p className="mt-2 text-2xl font-mono text-purple-700">{count > 0 ? String(number).repeat(count) : '—'}</p>
                        <p className="mt-1 text-xs text-slate-500">{count} {count === 1 ? 'digit' : 'digits'}</p>
                        <p className="mt-2 text-xs text-slate-500">{cell.description}</p>
                      </article>
                    );
                  })}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {calculate.psychomatrix.lines.map(line => (
                    <article key={line.name} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-800">{line.name}</h3>
                        <span className="rounded-md bg-purple-50 px-2 py-1 font-mono text-purple-700">{line.count}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{line.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-14 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bridge Numbers</h2>
                <p className="mt-1 text-sm text-slate-500">Each bridge is the absolute difference between its two core numbers. Name-based bridge values use the birth name.</p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                    <tr><th className="px-4 py-3">Bridge</th><th className="px-4 py-3">First number</th><th className="px-4 py-3">Second number</th><th className="px-4 py-3">Bridge number</th></tr>
                  </thead>
                  <tbody>
                    {calculate.bridges.map(bridge => (
                      <tr key={bridge.name} className="border-t border-slate-100">
                        <th className="px-4 py-3 font-semibold text-slate-700">{bridge.name}</th>
                        <td className="px-4 py-3">{bridge.leftLabel}: {formatNumber(bridge.leftValue)}</td>
                        <td className="px-4 py-3">{bridge.rightLabel}: {formatNumber(bridge.rightValue)}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-purple-700">{bridge.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-14 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-2xl font-bold text-slate-900">Home Number</h2>
              {calculate.houseNumber ? (
                <div className="mt-3 flex flex-wrap items-end gap-6">
                  <div>
                    <p className="text-sm text-slate-500">House / unit entered</p>
                    <p className="text-lg font-medium">{calculate.houseNumber.input}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Sum of digits and Pythagorean letter values</p>
                    <p className="text-lg font-medium">{calculate.houseNumber.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Reduced home number</p>
                    <p className="text-3xl font-light text-purple-700">{calculate.houseNumber.number}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">Enter a house or apartment number above to calculate its number. Do not include the street name.</p>
              )}
            </section>

            <div className="mt-12 text-center">
               <p className="text-sm text-slate-500">Calculations aligned with the provided NumeroScope Organizer references.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
