interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="64" height="64" rx="12" fill="#3498db" />

      <path
        d="M18 22C18 20.8954 18.8954 20 20 20H28C29.1046 20 30 20.8954 30 22V24C30 25.1046 29.1046 26 28 26H20C18.8954 26 18 25.1046 18 24V22Z"
        fill="white"
        opacity="0.9"
      />

      <path
        d="M18 30C18 28.8954 18.8954 28 20 28H40C41.1046 28 42 28.8954 42 30V32C42 33.1046 41.1046 34 40 34H20C18.8954 34 18 33.1046 18 32V30Z"
        fill="white"
      />

      <path
        d="M18 38C18 36.8954 18.8954 36 20 36H36C37.1046 36 38 36.8954 38 38V40C38 41.1046 37.1046 42 36 42H20C18.8954 42 18 41.1046 18 40V38Z"
        fill="white"
        opacity="0.8"
      />

      <circle cx="48" cy="40" r="8" fill="#e74c3c" />
      <path
        d="M44.5 40L46.5 42L51.5 37"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
