import React, { useState } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { MathMLToLaTeX } from "mathml-to-latex"; // Correct import

type Subpod = {
  plaintext?: string;
  img?: { src?: string; alt?: string };
  mathml?: string;
  sound?: { url: string };
  wav?: { url: string };
  minput?: string;
  moutput?: string;
  cell?: string;
};

type Pod = {
  title: string;
  subpods: Subpod[];
};

type Props = {
  pods: Pod[];
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

const getOutputTypes = (pods: Pod[]) => {
  const typeSet = new Set<string>();
  pods.forEach(pod => {
    pod.subpods.forEach(sub => {
      if (isNonEmptyString(sub.plaintext)) typeSet.add("Text");
      if (sub.moutput || sub.minput || sub.mathml) typeSet.add("Typeset Math");
      if (sub.img && sub.img.src) typeSet.add("Image");
      if (sub.sound && sub.sound.url) typeSet.add("Sound");
      if (sub.wav && sub.wav.url) typeSet.add("Wav");
      if (isNonEmptyString(sub.cell)) typeSet.add("Cell");
    });
  });
  return Array.from(typeSet);
};

const renderTypesetMath = (sub: Subpod) => {
  if (sub.moutput) return <BlockMath math={sub.moutput} />;
  if (sub.minput) return <BlockMath math={sub.minput} />;
  if (sub.mathml) {
    try {
      const latex = MathMLToLaTeX.convert(sub.mathml);
      return <BlockMath math={latex} />;
    } catch {
      return (
        <div
          className="mathml-block"
          dangerouslySetInnerHTML={{ __html: sub.mathml }}
          style={{ overflowX: "auto" }}
        />
      );
    }
  }
  return null;
};

const renderMathContent = (content: string) => {
  const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
  return parts.map((part, index) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const latex = part.slice(2, -2);
      return <BlockMath key={index} math={latex} />;
    } else if (part.startsWith("$") && part.endsWith("$")) {
      const latex = part.slice(1, -1);
      return <InlineMath key={index} math={latex} />;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
};

const DynamicTabsResult: React.FC<Props> = ({ pods }) => {
  const types = getOutputTypes(pods);
  const [activeTab, setActiveTab] = useState<string>(types[0] || "");

  if (!types.length) {
    return <div>No results available.</div>;
  }

  const getContent = () => {
    switch (activeTab) {
      case "Text":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => isNonEmptyString(sub.plaintext))
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <div>{renderMathContent(sub.plaintext || "")}</div>
              </div>
            ))
        );
      case "Typeset Math":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.moutput || sub.minput || sub.mathml)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <div>{renderTypesetMath(sub)}</div>
              </div>
            ))
        );
      case "Image":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.img && sub.img.src)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <img src={sub.img!.src} alt={sub.img!.alt || "Wolfram Image"} style={{ maxWidth: 350 }} />
              </div>
            ))
        );
      case "Sound":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.sound && sub.sound.url)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <audio controls src={sub.sound!.url} />
              </div>
            ))
        );
      case "Wav":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.wav && sub.wav.url)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <audio controls src={sub.wav!.url} />
              </div>
            ))
        );
      case "Cell": {
        const cellPods = pods.flatMap((pod, i) =>
          pod.subpods
            .filter(sub => isNonEmptyString(sub.cell))
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <pre>{sub.cell}</pre>
              </div>
            ))
        );
        return cellPods.length > 0 ? cellPods : <div>No cell data available.</div>;
      }
      default:
        return <div>No data</div>;
    }
  };

  return (
    <div>
      <div className="flex border-b mb-4">
        {types.map(type => (
          <button
            key={type}
            className={`px-4 py-2 mr-2 border-b-2 ${activeTab === type ? "border-blue-600 font-bold" : "border-transparent"}`}
            onClick={() => setActiveTab(type)}
            type="button"
          >
            {type}
          </button>
        ))}
      </div>
      <div>{getContent()}</div>
    </div>
  );
};

export default DynamicTabsResult;