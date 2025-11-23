import "./BlockCard.css";

export interface Block {
  leftType: "paragraph" | "url";
  leftContent: string;
  rightType: "paragraph" | "url";
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
          <p className="block-text">{leftContent}</p>
        ) : (
          <img className="info-image" src={leftContent} alt="Left Content" />
        )}
      </div>
      <div>
        {rightType === "paragraph" ? (
          <p className="block-text">{rightContent}</p>
        ) : (
          <img className="info-image" src={rightContent} alt="Right Content" />
        )}
      </div>
    </div>
  );
}
