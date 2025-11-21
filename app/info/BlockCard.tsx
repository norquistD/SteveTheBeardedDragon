import "./BlockCard.css";

export interface Block {
  leftType: "paragraph" | "image";
  leftContent: string;
  rightType: "paragraph" | "image";
  rightContent: string;
}

export function BlockCard({
  leftType,
  leftContent,
  rightType,
  rightContent,
}: Block) {
  return (
    <div className="block">
      <div>
        {leftType === "paragraph" ? (
          <p>{leftContent}</p>
        ) : (
          <img className="info-image" src={leftContent} alt="Left Content" />
        )}
      </div>
      <div>
        {rightType === "paragraph" ? (
          <p>{rightContent}</p>
        ) : (
          <img className="info-image" src={rightContent} alt="Right Content" />
        )}
      </div>
    </div>
  );
}
