/* Emerald material adapted from the user-supplied demo. */
export const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPos;

        void main() {
          vLocalPos = position;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
export const fragmentShader = `
        uniform float uRimIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;
        varying vec3 vLocalPos;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPosition);
          float NoV = clamp(dot(N, V), 0.0, 1.0);

          // Fresnel factor for thick glass rim thickness
          float fresnel = pow(1.0 - NoV, 2.35);
          float edgeFresnel = pow(1.0 - NoV, 4.2);

          // 1. Deep translucent forest-green inner core -> vibrant emerald rim
          vec3 deepCore = vec3(0.012, 0.11, 0.035);
          vec3 midEmerald = vec3(0.06, 0.56, 0.20);
          vec3 brightRim = vec3(0.22, 0.92, 0.42);

          vec3 baseColor = mix(deepCore, midEmerald, smoothstep(0.0, 0.72, fresnel));
          baseColor = mix(baseColor, brightRim, edgeFresnel * 0.85);

          // 2. Internal caustics / subtle glass thickness glow
          float bottomGlow = (1.0 - smoothstep(-1.0, -0.2, N.y)) * (1.0 - NoV);
          baseColor += vec3(0.15, 0.85, 0.38) * bottomGlow * 0.45;

          // 3. Top-Left Warm Golden-Yellow Studio Crown Reflection (Exact reference match)
          vec3 goldLightDir = normalize(vec3(-0.38, 0.82, 0.42));
          vec3 H_gold = normalize(goldLightDir + V);
          float goldSpecBroad = pow(max(dot(N, H_gold), 0.0), 18.0);
          float goldSpecSharp = pow(max(dot(N, H_gold), 0.0), 95.0);
          vec3 goldColor = vec3(1.0, 0.85, 0.32) * goldSpecBroad * 0.75 * uRimIntensity
                         + vec3(1.0, 0.96, 0.78) * goldSpecSharp * 0.95 * uRimIntensity;

          // 4. Top-Right Crisp Studio Rim Specular Streak
          vec3 topRightDir = normalize(vec3(0.55, 0.72, 0.40));
          vec3 H_tr = normalize(topRightDir + V);
          float trSpec = pow(max(dot(N, H_tr), 0.0), 42.0);
          vec3 trColor = vec3(0.58, 1.0, 0.78) * trSpec * 0.55;

          // 5. Bottom-Left Icy Cyan-Mint Refractive Bounce (Exact reference match)
          vec3 cyanDir = normalize(vec3(-0.68, -0.62, 0.38));
          float cyanMask = pow(max(dot(N, cyanDir), 0.0), 3.0) * fresnel;
          vec3 H_cyan = normalize(cyanDir + V);
          float cyanSpec = pow(max(dot(N, H_cyan), 0.0), 28.0);
          vec3 cyanColor = vec3(0.28, 0.98, 0.86) * (cyanMask * 0.95 + cyanSpec * 0.65) * uRimIntensity;

          // 6. Bottom Golden-Amber Internal Refraction Under Visor
          vec3 bottomGoldDir = normalize(vec3(0.12, -0.88, 0.45));
          float bottomGold = pow(max(dot(N, bottomGoldDir), 0.0), 8.0) * fresnel;
          vec3 bottomAmberColor = vec3(0.95, 0.82, 0.28) * bottomGold * 0.65 * uRimIntensity;

          // 7. Outer Glass Clearcoat Silhouette Streak
          float silhouette = smoothstep(0.72, 0.98, 1.0 - NoV);
          vec3 rimStreak = vec3(0.72, 1.0, 0.82) * silhouette * 0.42;

          vec3 finalRGB = baseColor + goldColor + trColor + cyanColor + bottomAmberColor + rimStreak;

          // Keep max luminance around 0.98 so the glass body has a lush, smooth finish
          // without triggering blocky bloom artifacts
          finalRGB = min(finalRGB, vec3(1.02));

          gl_FragColor = vec4(finalRGB, 1.0);
        }
      `;
