"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../../../components/IntlProvider";
import "./content-editor.css";

interface Content {
  content_id: number;
  content: string;
  is_url: boolean;
  language_id: number;
}

interface Block {
  block_id: number;
  content_id_left: number | null;
  content_id_right: number | null;
  location_id: number;
  position: number | null;
  leftContent?: Content;
  rightContent?: Content;
}

interface Location {
  location_id: number;
  location_name: string;
}

export default function ContentEditorPage({
  params,
}: {
  params: { locationId: string };
}) {
  const router = useRouter();
  const { languageId } = useLocale();
  const locationId = parseInt(params.locationId);
  const [location, setLocation] = useState<Location | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editingBlocks, setEditingBlocks] = useState<
    Record<
      number,
      {
        leftContent: string;
        rightContent: string;
        leftIsUrl: boolean;
        rightIsUrl: boolean;
      }
    >
  >({});
  const [titleBlock, setTitleBlock] = useState<Block | null>(null);

  useEffect(() => {
    fetchLocationData();
  }, [locationId, languageId]);

  const fetchLocationData = async () => {
    setLoading(true);
    try {
      // Fetch location details
      const locationResponse = await fetch(`/api/locations/${locationId}`);
      const locationResult = await locationResponse.json();

      if (locationResult.success) {
        setLocation(locationResult.data);
      }

      // Fetch content using the new GET endpoint
      if (!languageId) return;

      const contentResponse = await fetch(
        `/api/locations/${locationId}/content?language_id=${languageId}`
      );
      const contentResult = await contentResponse.json();

      if (contentResult.success) {
        const { title: fetchedTitle, content } = contentResult.data;

        // Set title
        setTitle(fetchedTitle);

        // Initialize editing state for content blocks
        const initialEditState: Record<
          number,
          {
            leftContent: string;
            rightContent: string;
            leftIsUrl: boolean;
            rightIsUrl: boolean;
          }
        > = {};

        // Convert content data to blocks format for editing
        // We need to fetch the actual block IDs, so we still need the blocks endpoint
        const blocksResponse = await fetch(
          `/api/blocks?location_id=${locationId}`
        );
        const blocksResult = await blocksResponse.json();

        if (blocksResult.success) {
          // Filter out title block and match with content data
          const contentBlocks = blocksResult.data
            .filter((b: Block) => b.position !== null)
            .sort(
              (a: Block, b: Block) => (a.position || 0) - (b.position || 0)
            );

          // Store title block separately
          const titleBlockData = blocksResult.data.find(
            (b: Block) => b.position === null
          );
          if (titleBlockData) {
            setTitleBlock(titleBlockData);
          }

          setBlocks(contentBlocks);

          // Map content from the new endpoint to blocks
          contentBlocks.forEach((block: Block, index: number) => {
            if (index < content.length) {
              initialEditState[block.block_id] = {
                leftContent: content[index].leftContent,
                rightContent: content[index].rightContent,
                leftIsUrl: content[index].leftType === "url",
                rightIsUrl: content[index].rightType === "url",
              };
            }
          });

          setEditingBlocks(initialEditState);
        }
      }
    } catch (error) {
      console.error("Failed to fetch location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!languageId) {
      console.error("No language selected");
      return;
    }

    setLoading(true);
    try {
      let contentId: number;

      // Check if we should update existing title content or create new
      if (titleBlock?.leftContent) {
        // Update existing content
        const contentResponse = await fetch(
          `/api/contents/${titleBlock.leftContent.content_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: title,
              is_url: false,
              language_id: Number(languageId),
            }),
          }
        );

        const contentResult = await contentResponse.json();
        if (!contentResult.success) {
          console.error("Failed to update title content");
          return;
        }
        contentId = titleBlock.leftContent.content_id;
      } else {
        // Create new content
        const contentResponse = await fetch("/api/contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: title,
            is_url: false,
            language_id: Number(languageId),
          }),
        });

        const contentResult = await contentResponse.json();
        if (!contentResult.success) {
          console.error("Failed to create title content");
          return;
        }
        contentId = Number(contentResult.data.content_id);
      }

      // Update or create title block
      if (titleBlock) {
        // Update existing title block
        await fetch(`/api/blocks/${titleBlock.block_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_id_left: Number(contentId),
            content_id_right: null,
            location_id: locationId,
            position: null,
          }),
        });
      } else {
        // Create new title block
        await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_id_left: Number(contentId),
            content_id_right: null,
            location_id: locationId,
            position: null,
          }),
        });
      }

      fetchLocationData();
    } catch (error) {
      console.error("Failed to save title:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!languageId) {
      console.error("No language selected");
      return;
    }

    setLoading(true);
    try {
      // Build content array from editing state
      const content = blocks.map((block) => {
        const editState = editingBlocks[block.block_id];
        return {
          leftContent: editState.leftContent,
          leftType: editState.leftIsUrl
            ? ("url" as const)
            : ("paragraph" as const),
          rightContent: editState.rightContent,
          rightType: editState.rightIsUrl
            ? ("url" as const)
            : ("paragraph" as const),
        };
      });

      // Use PUT endpoint to upsert all content at once
      const response = await fetch(`/api/locations/${locationId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          language_id: Number(languageId),
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Content saved successfully!");
        fetchLocationData();
      } else {
        alert("Failed to save content: " + result.error);
        console.error("Failed to save content:", result.error);
      }
    } catch (error) {
      alert("Failed to save content");
      console.error("Failed to save all content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async () => {
    if (!languageId) {
      console.error("No language selected");
      return;
    }

    setLoading(true);
    try {
      // Create empty content items
      const leftContentResponse = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "",
          is_url: false,
          language_id: Number(languageId),
        }),
      });

      const rightContentResponse = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "",
          is_url: false,
          language_id: Number(languageId),
        }),
      });

      const leftResult = await leftContentResponse.json();
      const rightResult = await rightContentResponse.json();

      if (leftResult.success && rightResult.success) {
        // Create block with next position
        const nextPosition =
          blocks.length > 0
            ? Math.max(...blocks.map((b) => b.position || 0)) + 1
            : 1;

        await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_id_left: Number(leftResult.data.content_id),
            content_id_right: Number(rightResult.data.content_id),
            location_id: locationId,
            position: nextPosition,
          }),
        });

        fetchLocationData();
      }
    } catch (error) {
      console.error("Failed to add block:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (
    contentId: number,
    newContent: string,
    isUrl: boolean
  ) => {
    if (!languageId) {
      console.error("No language selected");
      return;
    }

    try {
      await fetch(`/api/contents/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          is_url: isUrl,
          language_id: Number(languageId),
        }),
      });

      fetchLocationData();
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    setLoading(true);
    try {
      await fetch(`/api/blocks/${blockId}`, {
        method: "DELETE",
      });

      fetchLocationData();
    } catch (error) {
      console.error("Failed to delete block:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return (
      <div className="content-editor-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="content-editor-container">
      <div className="editor-header">
        <button onClick={() => router.push("/admin")} className="back-button">
          ← Back to Admin
        </button>
        <h1>Edit Content: {location.location_name}</h1>
      </div>

      <div className="editor-section">
        <h2>Title</h2>
        <div className="title-editor">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="title-input"
          />
        </div>
      </div>

      <div className="editor-section">
        <div className="section-header">
          <h2>Content Blocks</h2>
        </div>

        <div className="blocks-list">
          {blocks.map((block, index) => {
            const editState = editingBlocks[block.block_id] || {
              leftContent: block.leftContent?.content || "",
              rightContent: block.rightContent?.content || "",
              leftIsUrl: block.leftContent?.is_url || false,
              rightIsUrl: block.rightContent?.is_url || false,
            };

            return (
              <div key={block.block_id} className="block-editor">
                <div className="block-header">
                  <span className="block-number">Block {index + 1}</span>
                  <button
                    onClick={() => handleDeleteBlock(block.block_id)}
                    disabled={loading}
                    className="delete-block-button"
                  >
                    Delete
                  </button>
                </div>

                <div className="block-content-row">
                  <div className="content-editor-column">
                    <label>Left Side</label>
                    <select
                      value={editState.leftIsUrl ? "url" : "paragraph"}
                      onChange={(e) => {
                        setEditingBlocks({
                          ...editingBlocks,
                          [block.block_id]: {
                            ...editState,
                            leftIsUrl: e.target.value === "url",
                          },
                        });
                      }}
                      className="type-select"
                    >
                      <option value="paragraph">Text</option>
                      <option value="url">Image URL</option>
                    </select>
                    <textarea
                      value={editState.leftContent}
                      onChange={(e) => {
                        setEditingBlocks({
                          ...editingBlocks,
                          [block.block_id]: {
                            ...editState,
                            leftContent: e.target.value,
                          },
                        });
                      }}
                      placeholder={
                        editState.leftIsUrl ? "Enter image URL" : "Enter text"
                      }
                      className="content-textarea"
                    />
                  </div>

                  <div className="content-editor-column">
                    <label>Right Side</label>
                    <select
                      value={editState.rightIsUrl ? "url" : "paragraph"}
                      onChange={(e) => {
                        setEditingBlocks({
                          ...editingBlocks,
                          [block.block_id]: {
                            ...editState,
                            rightIsUrl: e.target.value === "url",
                          },
                        });
                      }}
                      className="type-select"
                    >
                      <option value="paragraph">Text</option>
                      <option value="url">Image URL</option>
                    </select>
                    <textarea
                      value={editState.rightContent}
                      onChange={(e) => {
                        setEditingBlocks({
                          ...editingBlocks,
                          [block.block_id]: {
                            ...editState,
                            rightContent: e.target.value,
                          },
                        });
                      }}
                      placeholder={
                        editState.rightIsUrl ? "Enter image URL" : "Enter text"
                      }
                      className="content-textarea"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {blocks.length === 0 && (
            <p className="no-blocks">
              No content blocks yet. Click "Add Block" to create one.
            </p>
          )}
          <div className="header-buttons">
            <button
              onClick={handleAddBlock}
              disabled={loading}
              className="add-block-button"
            >
              + Add Block
            </button>
            <button
              onClick={handleSaveAll}
              disabled={loading}
              className="save-all-button"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
