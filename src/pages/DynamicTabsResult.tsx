import React, { useState } from "react";
import { InlineMath, BlockMath } from "react-katex";

// Helper to render math
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

type Subpod = {
  plaintext?: string;
  img?: { src?: string; alt?: string };
  mathml?: string;
  sound?: { url: string };
  wav?: { url: string };
  minput?: string;
  moutput?: string;
  cell?: string;
  // ... add other types as needed
};

type Pod = {
  title: string;
  subpods: Subpod[];
  // ... add other pod props as needed
};

type Props = {
  pods: Pod[];
};

// Helper to collect all types present
const getOutputTypes = (pods: Pod[]) => {
  const typeSet = new Set<string>();
  pods.forEach(pod => {
    pod.subpods.forEach(sub => {
      if (sub.plaintext) typeSet.add("Text");
      if (sub.img && sub.img.src) typeSet.add("Image");
      if (sub.mathml) typeSet.add("MathML");
      if (sub.sound && sub.sound.url) typeSet.add("Sound");
      if (sub.wav && sub.wav.url) typeSet.add("Wav");
      if (sub.minput) typeSet.add("Wolfram Input");
      if (sub.moutput) typeSet.add("Wolfram Output");
      if (sub.cell) typeSet.add("Cell");
      // Add more as needed
    });
  });
  return Array.from(typeSet);
};

const DynamicTabsResult: React.FC<Props> = ({ pods }) => {
  const types = getOutputTypes(pods);
  const [activeTab, setActiveTab] = useState<string>(types[0] || "");

  // For each tab, filter only subpods with that type
  const getContent = () => {
    switch (activeTab) {
      case "Text":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.plaintext)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <div>{renderMathContent(sub.plaintext || "")}</div>
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
      case "MathML":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.mathml)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <div dangerouslySetInnerHTML={{ __html: sub.mathml! }} />
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
      case "Wolfram Input":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.minput)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <pre>{sub.minput}</pre>
              </div>
            ))
        );
      case "Wolfram Output":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.moutput)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <pre>{sub.moutput}</pre>
              </div>
            ))
        );
      case "Cell":
        return pods.map((pod, i) =>
          pod.subpods
            .filter(sub => sub.cell)
            .map((sub, j) => (
              <div key={`${i}-${j}`} className="mb-4">
                <strong>{pod.title}</strong>
                <pre>{sub.cell}</pre>
              </div>
            ))
        );
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