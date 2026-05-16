export default function SamovarIcon({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="24" width="16" height="11" rx="2" fill="#E8932A" />
      <path d="M11 14 Q8 20 8 24 H34 Q34 20 31 14Z" fill="#F2A53A" />
      <ellipse cx="21" cy="14" rx="10" ry="3.5" fill="#D4841A" />
      <rect x="17" y="9" width="8" height="5" rx="1" fill="#F5F0E4" opacity="0.8" />
      <rect x="19" y="5.5" width="4" height="3.5" rx="0.8" fill="#E8932A" />
      <circle cx="21" cy="4.5" r="1.8" fill="#F2A53A" />
      <rect x="19" y="35" width="6" height="2.5" rx="1" fill="#D4841A" opacity="0.6" />
      <rect x="15" y="37.5" width="12" height="1.5" rx="0.75" fill="#D4841A" opacity="0.4" />
      <line x1="34" y1="17" x2="38.5" y2="15" stroke="#F2A53A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="20.5" x2="39" y2="20.5" stroke="#F2A53A" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="24" x2="38.5" y2="25.5" stroke="#F2A53A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M19 7 Q17 3 19 0" stroke="#F2A53A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M23 7 Q25 3 23 0" stroke="#F2A53A" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  )
}
