import { type Block, BlockCard } from "./BlockCard";

import "./InfoPage.css";

export interface InfoPageData {
  title: string;
  content: Block[];
}

const sampleData: InfoPageData = {
  title: "Sample Info Page",
  content: [
    {
      leftType: "paragraph",
      leftContent: "This is a sample paragraph on the left.",
      rightType: "url",
      rightContent: "/bearded.png",
    },
    {
      leftType: "url",
      leftContent: "/bearded.png",
      rightType: "paragraph",
      rightContent: "This is a sample paragraph on the right.",
    },
    {
      leftType: "url",
      leftContent: "/bearded.png",
      rightType: "url",
      rightContent: "/bearded.png",
    },
    {
      leftType: "paragraph",
      leftContent: "This is a sample paragraph on the left.",
      rightType: "paragraph",
      rightContent: "This is a sample paragraph on the right.",
    },
  ],
};

export default function InfoPage() {
  const initialData = sampleData;

  return (
    <div className="info-page">
      <h1>{initialData.title}</h1>
      <div className="info-body">
        {initialData.content.map((block, index) => (
          <BlockCard
            key={index}
            leftType={block.leftType}
            leftContent={block.leftContent}
            rightType={block.rightType}
            rightContent={block.rightContent}
          />
        ))}
      </div>
    </div>
  );
}
