import React, { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'motion/react';
import {
  X,
  Users,
  AlertCircle,
  Layers,
  PlusCircle,
  ClipboardCheck,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const ITEM_WIDTH = 324;
const GAP = 16;
const CONTAINER_WIDTH = ITEM_WIDTH + GAP;
const DRAG_BUFFER = 40;
const VELOCITY_THRESHOLD = 400;

const SPRING_OPTIONS = {
  type: 'spring',
  stiffness: 330,
  damping: 30,
};

const GUIDE_CARDS = [
  {
    id: 1,
    step: 1,
    badge: 'Dual Profiles',
    title: 'Separate Care for Mom & Dad',
    icon: Users,
    instructions: [
      {
        label: 'Top Circle Icons',
        text: 'Tap the Left Circle for Grandmother, Right Circle for Grandfather at the top of your screen.',
      },
      {
        label: 'Or Just Swipe',
        text: 'Swipe left or right anywhere across the screen like flipping book pages to switch.',
      },
    ],
    scenario: 'Grandmother takes diabetes medication while Grandfather takes BP tablets. Having separate screens ensures you never order or count the wrong person\'s medicine.',
    cta: 'Next: Refill Status',
  },
  {
    id: 2,
    step: 2,
    badge: 'Refill Urgency',
    title: '3 Instant Color Sections',
    icon: AlertCircle,
    instructions: [
      {
        label: '🔴 Critical Refill',
        text: 'Less than 7 days of medicine left in the house. Place a pharmacy order now.',
      },
      {
        label: '🟡 Attention Required',
        text: 'Active strip has only 2–3 pills left, or stock is running low.',
      },
      {
        label: '🟢 All Good',
        text: 'Plenty of medicine safe in reserve for more than 14 days.',
      },
    ],
    scenario: 'Before calling Apollo Pharmacy or opening 1mg on your phone, check the top red section. If it\'s empty, your parents have plenty of supply.',
    cta: 'Next: Blister Strips',
  },
  {
    id: 3,
    step: 3,
    badge: 'Active Strips',
    title: 'Blister Pack "Drop Zone"',
    icon: Layers,
    instructions: [
      {
        label: 'Tap Any Card',
        text: 'Expand any medicine card to view the physical blister pack and individual pill bubbles.',
      },
      {
        label: 'The "Drop Zone"',
        text: 'Sanjeevani warns you with an amber tag when only 2–3 pills remain on an open strip.',
      },
    ],
    scenario: 'Elderly parents often discard nearly-finished strips early, or open a fresh strip while 2 pills remain on the old one. Sanjeevani accounts for this so you don\'t get surprised.',
    cta: 'Next: Adding Medicines',
  },
  {
    id: 4,
    step: 4,
    badge: 'Prescriptions',
    title: 'Adding a New Medicine',
    icon: PlusCircle,
    instructions: [
      {
        label: 'Floating (+) Button',
        text: 'Tap the circular (+) button at the bottom right corner of the home screen.',
      },
      {
        label: 'Select Profile',
        text: 'Choose whether the prescription is for Grandmother or Grandfather.',
      },
      {
        label: 'Set Dose & Packs',
        text: 'Enter daily frequency (Morning, Noon, Night) and total unopened strips delivered.',
      },
    ],
    scenario: 'Doctor prescribed a new tablet after their hospital checkup? Add it once in 20 seconds, and Sanjeevani tracks daily consumption automatically.',
    cta: 'Next: Physical Count',
  },
  {
    id: 5,
    step: 5,
    badge: 'Physical Audit',
    title: 'Weekend Visit Count Match',
    icon: ClipboardCheck,
    instructions: [
      {
        label: 'Details & Actions',
        text: 'Tap "Details & Actions" on any card when you visit them at home.',
      },
      {
        label: 'Tap the Dots',
        text: 'Tap "Match Count" and tap the pill bubbles to match what is physically in their box.',
      },
      {
        label: '+ Multiple Strips',
        text: 'Tap "+ Found Another Open Strip" if you find multiple opened packs in use.',
      },
    ],
    scenario: 'Visiting on Sunday? Check their medicine basket. If counts match what the app expects, tap "Count Matches" in 1 second. If pills were skipped, tap to sync.',
    cta: 'Next: Family Sharing',
  },
  {
    id: 6,
    step: 6,
    badge: 'Family Sharing',
    title: '1-Tap WhatsApp Updates',
    icon: MessageCircle,
    instructions: [
      {
        label: 'WhatsApp Button',
        text: 'Tap the green WhatsApp button located directly on any medicine card.',
      },
      {
        label: 'Zero Typing Needed',
        text: 'A clean, pre-formatted inventory summary opens directly in WhatsApp ready to send.',
      },
    ],
    scenario: 'Need your sibling or spouse to buy medicines on their commute home? Tap WhatsApp to send: "Mom has 12 days left of Metformin, 2 full strips remaining."',
    cta: 'Next: Peace of Mind',
  },
  {
    id: 7,
    step: 7,
    badge: 'Peace of Mind',
    title: 'Zero Tech for Parents',
    icon: ShieldCheck,
    instructions: [
      {
        label: 'No App for Parents',
        text: 'Your elderly parents never touch or struggle with this smartphone app.',
      },
      {
        label: 'History Tab',
        text: 'Check the History tab at the bottom to see past verification dates and counts.',
      },
    ],
    scenario: 'Keep all tracking in your pocket as the caring child. You stay in control while your parents take their medications on time without confusion.',
    cta: 'Got It, Let\'s Start',
  },
];

function CarouselCard({
  item,
  index,
  x,
  itemCount,
  onNext,
  isLast,
}) {
  const nextIndex = Math.min(index + 1, itemCount - 1);
  const prevIndex = Math.max(index - 1, 0);

  const range = [
    (-100 * (index + 1) * CONTAINER_WIDTH) / 100,
    (-100 * index * CONTAINER_WIDTH) / 100,
    (-100 * (index - 1) * CONTAINER_WIDTH) / 100,
  ];
  const outputRange = [nextIndex ? 60 : 60, 0, prevIndex ? -60 : -60];

  const rotateY = useTransform(x, range, outputRange, { clamp: false });
  const Icon = item.icon;

  return (
    <motion.div
      style={{
        width: ITEM_WIDTH,
        height: 510,
        rotateY,
        flexShrink: 0,
      }}
      transition={SPRING_OPTIONS}
      className="
        flex flex-col justify-between
        rounded-[32px] border-[1.6px] border-[#E5E5EA] bg-white
        p-6 shadow-xl cursor-grab active:cursor-grabbing select-none
      "
    >
      <div className="flex flex-col">
        {/* Top Header: Icon + Step Counter Badge */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] text-[#1C1C1E] shadow-xs">
            <Icon size={24} strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Step {item.step} of {itemCount}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1C1C1E] text-white">
              {item.badge}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[19px] sm:text-[20px] font-bold text-[#1C1C1E] tracking-tight leading-snug mb-3">
          {item.title}
        </h3>

        {/* Formatted Instructions List */}
        <div className="flex flex-col gap-2 mb-3.5">
          {item.instructions.map((inst, i) => (
            <div key={i} className="flex items-start gap-2 text-[12px] sm:text-[12.5px] text-[#3A3A3C] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
              <span>
                <strong className="text-[#1C1C1E] font-semibold">{inst.label}:</strong> {inst.text}
              </span>
            </div>
          ))}
        </div>

        {/* Real-world Use Case Box */}
        <div className="rounded-2xl bg-[#F8F9FB] border border-[#E5E5EA] p-3 text-[11.5px] text-[#6E6E73] leading-relaxed">
          <div className="flex items-center gap-1.5 text-[#1C1C1E] font-bold mb-1">
            <span className="text-xs">💡</span>
            <span>Real-Life Scenario for Dad</span>
          </div>
          <p className="italic text-[#3A3A3C]">"{item.scenario}"</p>
        </div>
      </div>

      {/* Action CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className={`
          w-full py-3 px-5 rounded-full font-bold text-xs sm:text-[13px] shadow-xs
          flex items-center justify-center gap-2 transition-colors mt-2
          ${isLast ? 'bg-[#34C759] text-white hover:bg-green-600' : 'bg-[#1C1C1E] text-white hover:bg-black'}
        `}
      >
        <span>{item.cta}</span>
        {isLast ? <CheckCircle2 size={15} /> : <ArrowRight size={15} />}
      </motion.button>
    </motion.div>
  );
}

export function AppGuideModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.min(prev + 1, GUIDE_CARDS.length - 1));
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleNext = () => {
    if (currentIndex < GUIDE_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const leftConstraint = -((ITEM_WIDTH + GAP) * (GUIDE_CARDS.length - 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Frosted Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={SPRING_OPTIONS}
            className="relative z-10 flex flex-col items-center max-w-sm w-full"
          >
            {/* Header: Title & Close Button */}
            <div className="w-full flex items-center justify-between px-2 mb-2.5 text-white">
              <div>
                <h2 className="text-[17px] font-bold tracking-tight">
                  How to Use Sanjeevani
                </h2>
                <p className="text-[11.5px] text-white/70">
                  Step {currentIndex + 1} of {GUIDE_CARDS.length} • Swipe to navigate
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close guide"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* 3D Perspective Card Carousel */}
            <div
              className="relative overflow-hidden"
              style={{ width: ITEM_WIDTH, height: 510 }}
            >
              <motion.div
                className="flex"
                drag="x"
                dragConstraints={{ left: leftConstraint, right: 0 }}
                style={{
                  gap: GAP,
                  perspective: 1000,
                  perspectiveOrigin: currentIndex * ITEM_WIDTH + ITEM_WIDTH / 2,
                  x,
                }}
                onDragEnd={handleDragEnd}
                animate={{ x: -(currentIndex * CONTAINER_WIDTH) }}
                transition={SPRING_OPTIONS}
              >
                {GUIDE_CARDS.map((card, idx) => (
                  <CarouselCard
                    key={card.id}
                    item={card}
                    index={idx}
                    x={x}
                    itemCount={GUIDE_CARDS.length}
                    onNext={handleNext}
                    isLast={idx === GUIDE_CARDS.length - 1}
                  />
                ))}
              </motion.div>
            </div>

            {/* Pagination Indicators */}
            <div className="mt-3 flex items-center gap-1.5">
              {GUIDE_CARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                    currentIndex === i 
                      ? 'w-6 bg-white shadow-xs' 
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AppGuideModal;
