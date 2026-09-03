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
  CheckCircle2,
  MessageCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const ITEM_WIDTH = 300;
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
    badge: 'Dual Profiles',
    title: 'Grandmother & Grandfather',
    icon: Users,
    description: 'Easily toggle between Mom\'s and Dad\'s medications using the circular icons at the top, or by simply swiping left and right anywhere on the home screen.',
    scenario: 'Keep Grandmother\'s diabetes pills separate from Grandfather\'s BP medicine so their schedules and stocks are never mixed up.',
    cta: 'Next: Refill Status',
  },
  {
    id: 2,
    badge: 'Smart Sections',
    title: 'Instant Refill Alerts',
    icon: AlertCircle,
    description: 'All medicines are automatically sorted into 3 clear sections: Critical Refill (🔴), Attention Required (🟡), and All Good (🟢) based on daily depletion.',
    scenario: 'Glance at the home screen before visiting or ordering from 1mg/Apollo. If any medicine is in the Critical section, you know to reorder immediately.',
    cta: 'Next: Blister Strips',
  },
  {
    id: 3,
    badge: 'Blister Foils',
    title: 'Drop Zone Prediction',
    icon: Layers,
    description: 'Expand any medicine card to view the physical silver blister pack. Sanjeevani predicts the "Drop Zone" when only 2–3 pills remain on an open strip.',
    scenario: 'Grandparents often discard or open a new strip early when 2–3 pills are left. Sanjeevani accounts for this so you\'re never caught by an empty box.',
    cta: 'Next: Physical Count',
  },
  {
    id: 4,
    badge: 'Physical Count',
    title: 'Match Actual Strips',
    icon: CheckCircle2,
    description: 'Tap "Details & Actions" ➔ "Match Count" to tap physical blister dots directly and adjust counts. Tap "+ Found Another Open Strip" if multiple strips are in use.',
    scenario: 'During your visit, tap the blister bubbles to match what is physically in their medicine box with one touch, or tap "Count Matches" if all is in sync.',
    cta: 'Next: WhatsApp Updates',
  },
  {
    id: 5,
    badge: 'Family Updates',
    title: 'WhatsApp & History',
    icon: MessageCircle,
    description: 'Tap "WhatsApp" on any card to send an instant, pre-formatted inventory update to your family or siblings without having to type anything.',
    scenario: 'Keep your siblings informed in seconds: "Mom has 14 days of Metformin safe, 2 full strips remaining." Check the History tab to see past logs.',
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
        height: 440,
        rotateY,
        flexShrink: 0,
      }}
      transition={SPRING_OPTIONS}
      className="
        flex flex-col justify-between
        rounded-[32px] border-[1.6px] border-[#E5E5EA] bg-white
        p-6 sm:p-7 shadow-xl cursor-grab active:cursor-grabbing select-none
      "
    >
      <div>
        {/* Top Icon & Badge Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] text-[#1C1C1E] shadow-xs">
            <Icon size={26} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F2F2F7] text-[#1C1C1E] border border-[#E5E5EA]">
            {item.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-bold text-[#1C1C1E] tracking-tight leading-snug mb-2">
          {item.title}
        </h3>

        {/* Feature Explanation */}
        <p className="text-[13px] text-[#3A3A3C] leading-relaxed mb-3.5">
          {item.description}
        </p>

        {/* Real-world Scenario Callout */}
        <div className="rounded-xl bg-[#F8F9FB] border border-[#E5E5EA] p-3 text-[12px] text-[#6E6E73] leading-relaxed">
          <strong className="text-[#1C1C1E] font-semibold block mb-0.5">Real-life Scenario:</strong>
          <span>{item.scenario}</span>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={onNext}
        className={`
          w-full py-3 px-5 rounded-full font-bold text-xs shadow-xs
          flex items-center justify-center gap-2 transition-colors
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
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
            <div className="w-full flex items-center justify-between px-2 mb-3 text-white">
              <div>
                <h2 className="text-[17px] font-bold tracking-tight">
                  How to Use Sanjeevani
                </h2>
                <p className="text-[11.5px] text-white/70">
                  Swipe or tap to explore features & scenarios
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
              style={{ width: ITEM_WIDTH, height: 440 }}
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
            <div className="mt-4 flex items-center gap-2">
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
