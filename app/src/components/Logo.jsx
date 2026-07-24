export default function Logo({ compact = false }) {
  return (
    <svg
      viewBox="0 0 190 46"
      width={compact ? 96 : 130}
      height={compact ? 24 : 32}
      role="img"
      aria-label="J&T Express"
    >
      <text
        x="0"
        y="34"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="34"
        fill="#e4032e"
        letterSpacing="-1"
      >
        J&amp;T
      </text>
      <text
        x="78"
        y="30"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="14"
        fill="#e4032e"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}
