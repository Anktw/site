import NextImage from "next/image";

type ImageProps = {
  link: string;
  alt?: string;
  height?: number | string;
  width?: number | string;
};

export function Image({ link, alt = "", height, width }: ImageProps) {

  const Caption = alt ? (
    <div style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#555" }}>
      {alt}
    </div>
  ) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "1.5rem 0"
      }}
    >
      <NextImage
        src={link}
        alt={alt}
        height={typeof height === "string" ? parseInt(height) : height}
        width={typeof width === "string" ? parseInt(width) : width}
      />
      {Caption}
    </div>
  );
}
