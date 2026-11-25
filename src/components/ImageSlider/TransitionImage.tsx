import { CSSProperties, useEffect, useRef, useState } from "react";
import { ISettings } from "../../utils/localStorage";

interface Layer {
  key: number;
  src: string;
}

/**
 * Shows the current image and, while a transition runs, the outgoing one beneath it.
 * The animations themselves live in index.css, keyed off the "t-<transition>" class.
 */
export const TransitionImage = ({
  src,
  settings,
}: {
  src: string;
  settings: ISettings;
}) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const nextKey = useRef(0);
  const transition = settings.transition ?? "none";
  const duration = transition === "none" ? 0 : settings.transitionDuration ?? 400;

  useEffect(() => {
    if (!src) return;
    const key = nextKey.current++;
    // Keep only the outgoing image and the new one
    setLayers((prev) => [...prev.slice(-1), { key, src }]);

    const cleanup = setTimeout(
      () => setLayers((prev) => prev.filter((layer) => layer.key >= key)),
      duration,
    );
    return () => clearTimeout(cleanup);
  }, [src]);

  const filters = [
    settings.contrastMultiplier && `contrast(${settings.contrastMultiplier})`,
    settings.grayscale && "grayscale(1)",
  ].filter(Boolean);

  const imageStyle: CSSProperties = {
    objectFit: settings.imageFit ?? "contain",
    filter: filters.length ? filters.join(" ") : undefined,
    transform: settings.mirror ? "scaleX(-1)" : undefined,
  };

  return (
    <div
      id="image-container"
      className={`t-${transition}`}
      style={{ "--transition-duration": `${duration}ms` } as CSSProperties}
    >
      {layers.map((layer, index) => (
        <div
          key={layer.key}
          className={`image-layer ${
            index === layers.length - 1 ? "entering" : "leaving"
          }`}
        >
          <img src={layer.src} style={imageStyle} />
        </div>
      ))}
    </div>
  );
};
