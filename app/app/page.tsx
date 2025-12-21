'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
import { BookOpen, User, Calendar, RotateCcw, LogOut } from 'lucide-react';

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
}

interface ReportItem {
  id: number;
  name: string;
  val: number | number[] | string;
  desc: string;
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

const VOWELS: string[] = ['A', 'E', 'I', 'O', 'U'];
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

// --- MAIN COMPONENT ---

export default function NumeroScope() {
  const [inputs, setInputs] = useState<Inputs>({
    day: '', month: '', year: '', birthName: '', schoolName: '', currentName: ''
  });
  const [showReport, setShowReport] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // --- CALCULATION LOGIC ---
  const calculate = useMemo<ReportItem[] | null>(() => {
    if (!inputs.day || !inputs.month || !inputs.year || !inputs.birthName || !inputs.currentName || !inputs.schoolName) return null;

    const dayRaw = parseInt(inputs.day);
    const monthRaw = parseInt(inputs.month);
    const yearRaw = parseInt(inputs.year);

    if (isNaN(dayRaw) || isNaN(monthRaw) || isNaN(yearRaw)) return null;
    if (dayRaw < 1 || dayRaw > 31 || monthRaw < 1 || monthRaw > 12 || yearRaw < 1000 || yearRaw > 9999) return null;

    const birthNameClean = cleanStringWithSpaces(inputs.birthName);
    const schoolNameClean = cleanStringWithSpaces(inputs.schoolName);
    const currentNameClean = cleanStringWithSpaces(inputs.currentName);
    
    const birthNameParts = birthNameClean.split(' ');
    const currentNameParts = currentNameClean.split(' ');
    
    const firstNameBirth = birthNameParts[0] || "";
    const lastNameBirth = birthNameParts[birthNameParts.length - 1] || "";
    const firstNameCurrent = currentNameParts[0] || "";
    const lastNameCurrent = currentNameParts[currentNameParts.length - 1] || "";

    // Core Variables (PDF Page 4: Sum the reduced Month + Day + Year)
    const dayNumber = reduceNumber(dayRaw);
    const monthNumber = reduceNumber(monthRaw);
    const yearNumber = reduceNumber(yearRaw);
    const lifePath = reduceNumber(dayNumber) + reduceNumber(monthNumber) + reduceNumber(yearNumber); 

    const calculateSum = (text: string, systemMap: SystemMap, filter: 'all' | 'vowel' | 'consonant' = 'all'): number => {
      const clean = cleanString(text);
      let sum = 0;
      for (let char of clean) {
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
        
        for (let char of clean) {
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
        for (let char of clean) {
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
    
    // 6. Contribution (Page 7): Life Path + BIRTH Name (Pyth) -> Reduced
    const birthNameSumPyth = reduceNumber(calculateSum(birthNameClean, PYTH_MAP));
    const contribution = reduceNumber(lifePath + birthNameSumPyth);
    
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

    return [
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
    ];
  }, [inputs]);

  const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/';
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            alert('An error occurred during logout');
        }
    }

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
                onClick={() => { setInputs({ day: '', month: '', year: '', birthName: '', schoolName: '', currentName: '' }); setShowReport(false); }}
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
            
            <div className={`grid gap-6 ${showReport ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1'}`}>
              
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
                <label className="flex items-center gap-2 text-sm font-medium text-amber-600"><BookOpen size={16} /> School Name</label>
                <input type="text" name="schoolName" placeholder="Childhood School Name" value={inputs.schoolName} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-indigo-600"><User size={16} /> Current Name</label>
                <input type="text" name="currentName" placeholder="Name known for longer" value={inputs.currentName} onChange={handleInputChange} className="w-full px-4 py-3 transition-all bg-white border outline-none rounded-lg border-slate-300 focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"/>
              </div>
            </div>

            {!showReport && (
              <button onClick={() => calculate ? setShowReport(true) : alert("Please fill all fields correctly")} disabled={!calculate} className="w-full mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Submit
              </button>
            )}
          </div>
        </section>

        {showReport && calculate && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {calculate.map((item) => (
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
            <div className="mt-12 text-center">
               <p className="text-sm text-slate-500">Calculations aligned with NGA NumeroScope Assignments.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}