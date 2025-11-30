"use client";

interface Props {
  className?: string;
  alt?: string;
}

export default function PatientAvatar({ className = "w-40 h-40", alt = "Paciente" }: Props) {
  return (
    <div className={`${className} bg-gray-200 rounded-md flex items-center justify-center border border-gray-300`}>
      <svg className="w-16 h-16 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
