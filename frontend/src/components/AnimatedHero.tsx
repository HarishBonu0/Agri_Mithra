import { memo } from "react";

export const AnimatedHero = memo(() => {
  return (
    <div className="relative h-64 w-full flex items-center justify-center md:h-80">
      <svg
        viewBox="0 0 200 280"
        className="h-48 w-48 md:h-64 md:w-64 drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes leafGrow {
                0% {
                  transform: scaleY(0.3) scaleX(0.3);
                  opacity: 0.5;
                }
                50% {
                  transform: scaleY(1.05) scaleX(1.05);
                }
                100% {
                  transform: scaleY(1) scaleX(1);
                  opacity: 1;
                }
              }

              @keyframes leafSway {
                0%, 100% {
                  transform: rotate(0deg);
                }
                25% {
                  transform: rotate(1deg);
                }
                75% {
                  transform: rotate(-1deg);
                }
              }

              @keyframes ciruitPulse {
                0%, 100% {
                  opacity: 0.3;
                  r: 3;
                }
                50% {
                  opacity: 0.8;
                  r: 5;
                }
              }

              @keyframes veinGrow {
                0% {
                  stroke-dashoffset: 50;
                  opacity: 0;
                }
                50% {
                  opacity: 0.6;
                }
                100% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
              }

              .leaf-shape {
                animation: leafGrow 1.2s ease-out, leafSway 3s ease-in-out 1.2s infinite;
                transform-origin: 100px 140px;
              }

              .vein-line {
                animation: veinGrow 1.8s ease-out 0.6s forwards;
                stroke-dasharray: 50;
              }

              .circuit-dot {
                animation: ciruitPulse 2s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        {/* Leaf shape - ellipse body */}
        <g className="leaf-shape">
          <ellipse
            cx="100"
            cy="100"
            rx="45"
            ry="65"
            fill="url(#leafGradient)"
            opacity="0.95"
          />

          {/* Leaf tip - triangle */}
          <polygon
            points="100,25 85,55 115,55"
            fill="url(#leafGradient)"
            opacity="0.9"
          />

          {/* Center vein */}
          <line
            x1="100"
            y1="30"
            x2="100"
            y2="150"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.5"
            className="vein-line"
          />

          {/* Left vein */}
          <path
            d="M 85 60 Q 70 80 65 110"
            stroke="#ffffff"
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
            className="vein-line"
            style={{ animationDelay: "0.8s" }}
          />

          {/* Right vein */}
          <path
            d="M 115 60 Q 130 80 135 110"
            stroke="#ffffff"
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
            className="vein-line"
            style={{ animationDelay: "1s" }}
          />
        </g>

        {/* Circuit lines and dots - AI element */}
        <g filter="url(#glow)">
          {/* Circuit branch 1 */}
          <path
            d="M 85 80 L 50 50 L 40 40"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
            className="vein-line"
            style={{ animationDelay: "1.2s" }}
          />
          <circle cx="40" cy="40" className="circuit-dot" stroke="#16a34a" strokeWidth="1" fill="none" />

          {/* Circuit branch 2 */}
          <path
            d="M 115 80 L 150 50 L 160 40"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
            className="vein-line"
            style={{ animationDelay: "1.2s" }}
          />
          <circle cx="160" cy="40" className="circuit-dot" stroke="#22c55e" strokeWidth="1" fill="none" style={{ animationDelay: "0.2s" }} />

          {/* Circuit branch 3 */}
          <path
            d="M 100 150 L 80 180 L 70 200"
            stroke="#16a34a"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
            className="vein-line"
            style={{ animationDelay: "1.4s" }}
          />
          <circle cx="70" cy="200" className="circuit-dot" stroke="#16a34a" strokeWidth="1" fill="none" style={{ animationDelay: "0.4s" }} />

          {/* Center circuit node */}
          <circle cx="100" cy="100" className="circuit-dot" r="3" stroke="#16a34a" strokeWidth="1" fill="none" style={{ animationDelay: "0s" }} />
        </g>

        {/* Floating glow effect */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke="url(#leafGradient)"
          strokeWidth="0.5"
          opacity="0.2"
          style={{
            animation: "leafSway 4s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
      </svg>
    </div>
  );
});

AnimatedHero.displayName = "AnimatedHero";
