export function RotationControlButton({
  rotationState,
  setRotationState
}: {
  rotationState: 'rotating' | 'paused' | 'stopped';
  setRotationState: (state: 'rotating' | 'paused' | 'stopped') => void;
}) {
  const toggleRotation = () => {
    if (rotationState === 'rotating') {
      setRotationState('stopped');
    } else if (rotationState === 'paused') {
      setRotationState('stopped'); // Convert pause to stop when button is clicked
    } else {
      setRotationState('rotating');
    }
  };

  const isRotating = rotationState === 'rotating';
  const buttonLabel = isRotating
    ? 'Pause globe rotation'
    : 'Resume globe rotation';

  return (
    <button
      onClick={toggleRotation}
      onMouseUp={(e) => e.currentTarget.blur()}
      className='absolute bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-transparent px-3 py-2 text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-110 hover:border-blue-300'
      aria-label={buttonLabel}
      title={buttonLabel}
    >
      {rotationState === 'stopped' ? (
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
        >
          <path d='M8 5v14l11-7z' />
        </svg>
      ) : (
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='currentColor'
          aria-hidden='true'
        >
          <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
        </svg>
      )}
    </button>
  );
}
