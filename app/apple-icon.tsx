import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#3498db',
          borderRadius: '36px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="64" height="64" rx="0" fill="transparent" />
          <path
            d="M12 14C12 12.8954 12.8954 12 14 12H22C23.1046 12 24 12.8954 24 14V16C24 17.1046 23.1046 18 22 18H14C12.8954 18 12 17.1046 12 16V14Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M12 22C12 20.8954 12.8954 20 14 20H34C35.1046 20 36 20.8954 36 22V24C36 25.1046 35.1046 26 34 26H14C12.8954 26 12 25.1046 12 24V22Z"
            fill="white"
          />
          <path
            d="M12 30C12 28.8954 12.8954 28 14 28H30C31.1046 28 32 28.8954 32 30V32C32 33.1046 31.1046 34 30 34H14C12.8954 34 12 33.1046 12 32V30Z"
            fill="white"
            opacity="0.8"
          />
          <circle cx="42" cy="32" r="8" fill="#e74c3c" />
          <path
            d="M38.5 32L40.5 34L45.5 29"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
