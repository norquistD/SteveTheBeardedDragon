// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useLocale } from "../../../components/IntlProvider";
// import Spinner from "../../../components/Spinner";
// import "./content-editor.css";

// interface Content {
//   content_id: number;
//   content: string;
//   is_url: boolean;
//   language_id: number;
// }

// interface Block {
//   block_id: number;
//   content_id_left: number | null;
//   content_id_right: number | null;
//   location_id: number;
//   position: number | null;
//   leftContent?: Content;
//   rightContent?: Content;
// }

// interface Location {
//   location_id: number;
//   location_name: string;
//   location_label: string;
// }

// export default function ContentEditorPage({
//   params,
// }: {
//   params: { locationId: string };
// }) {
//   const router = useRouter();
//   const { languageId } = useLocale();
//   const locationId = parseInt(params.locationId);
//   const [location, setLocation] = useState<Location | null>(null);
//   const [blocks, setBlocks] = useState<Block[]>([]);
//   const [title, setTitle] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [editingBlocks, setEditingBlocks] = useState<
//     Record<
//       number,
//       {
//         leftContent: string;
//         rightContent: string;
//         leftIsUrl: boolean;
//         rightIsUrl: boolean;
//       }
//     >
//   >({});
//   const [titleBlock, setTitleBlock] = useState<Block | null>(null);

//   useEffect(() => {
//     fetchLocationData();
//   }, [locationId, languageId]);

//   const fetchLocationData = async () => {
//     setLoading(true);
//     try {
//       // Fetch location details
//       const locationResponse = await fetch(`/api/locations/${locationId}`);
//       const locationResult = await locationResponse.json();

//       if (locationResult.success) {
//         setLocation(locationResult.data);
//       }

//       // Fetch content using the GET endpoint
//       const contentResponse = await fetch(
//         `/api/locations/${locationId}/content?language_id=${languageId}`
//       );
//       const contentResult = await contentResponse.json();

//       if (contentResult.success) {
//         const { title: fetchedTitle, content } = contentResult.data;

//         // Set title
//         setTitle(fetchedTitle);

//         // Clear previous state before setting new data
//         setBlocks([]);
//         setEditingBlocks({});

//         // Initialize editing state for content blocks
//         // Create temporary block objects for the UI
//         const tempBlocks: Block[] = content.map(
//           (_item: any, index: number) => ({
//             block_id: index, // Use index as temporary ID
//             content_id_left: null,
//             content_id_right: null,
//             location_id: locationId,
//             position: index + 1,
//           })
//         );

//         setBlocks(tempBlocks);

//         const initialEditState: Record<
//           number,
//           {
//             leftContent: string;
//             rightContent: string;
//             leftIsUrl: boolean;
//             rightIsUrl: boolean;
//           }
//         > = {};

//         // Map content to editing state
//         content.forEach((block: any, index: number) => {
//           initialEditState[index] = {
//             leftContent: block.leftContent,
//             rightContent: block.rightContent,
//             leftIsUrl: block.leftType === "url",
//             rightIsUrl: block.rightType === "url",
//           };
//         });

//         setEditingBlocks(initialEditState);
//       }
//     } catch (error) {
//       console.error("Failed to fetch location data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveAll = async () => {
//     if (!languageId) {
//       console.error("No language selected");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Build content array from editing state
//       const content = blocks.map((block) => {
//         const editState = editingBlocks[block.block_id];
//         return {
//           leftContent: editState.leftContent,
//           leftType: editState.leftIsUrl
//             ? ("url" as const)
//             : ("paragraph" as const),
//           rightContent: editState.rightContent,
//           rightType: editState.rightIsUrl
//             ? ("url" as const)
//             : ("paragraph" as const),
//         };
//       });

//       // Use PUT endpoint to upsert all content at once
//       const response = await fetch(`/api/locations/${locationId}/content`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title,
//           content,
//           language_id: Number(languageId),
//         }),
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert("Content saved successfully!");
//         fetchLocationData();
//       } else {
//         alert("Failed to save content: " + result.error);
//         console.error("Failed to save content:", result.error);
//       }
//     } catch (error) {
//       alert("Failed to save content");
//       console.error("Failed to save all content:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddBlock = () => {
//     // Add a new block to local state
//     const newBlockId = blocks.length;
//     const newBlock: Block = {
//       block_id: newBlockId,
//       content_id_left: null,
//       content_id_right: null,
//       location_id: locationId,
//       position: newBlockId + 1,
//     };

//     setBlocks([...blocks, newBlock]);
//     setEditingBlocks({
//       ...editingBlocks,
//       [newBlockId]: {
//         leftContent: "",
//         rightContent: "",
//         leftIsUrl: false,
//         rightIsUrl: false,
//       },
//     });
//   };

//   const handleDeleteBlock = (blockId: number) => {
//     // Remove block from local state
//     setBlocks(blocks.filter((b) => b.block_id !== blockId));
//     const newEditingBlocks = { ...editingBlocks };
//     delete newEditingBlocks[blockId];
//     setEditingBlocks(newEditingBlocks);
//   };

//   if (!location) {
//     return (
//       <div className="content-editor-container">
//         <div className="spinner-container">
//           <Spinner size="large" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="content-editor-container">
//       {loading && (
//         <div className="spinner-overlay">
//           <Spinner size="large" />
//         </div>
//       )}
//       <div className="editor-header">
//         <button onClick={() => router.push("/admin")} className="back-button">
//           ← Back to Admin
//         </button>
//         <h1>Edit Content: {location.location_name}</h1>
//       </div>

//       <div className="editor-section">
//         <h2>Title</h2>
//         <div className="title-editor">
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Enter title"
//             className="title-input"
//           />
//         </div>
//       </div>

//       <div className="editor-section">
//         <div className="section-header">
//           <h2>Content Blocks</h2>
//         </div>

//         <div className="blocks-list">
//           {blocks.map((block, index) => {
//             const editState = editingBlocks[block.block_id] || {
//               leftContent: block.leftContent?.content || "",
//               rightContent: block.rightContent?.content || "",
//               leftIsUrl: block.leftContent?.is_url || false,
//               rightIsUrl: block.rightContent?.is_url || false,
//             };

//             return (
//               <div key={block.block_id} className="block-editor">
//                 <div className="block-header">
//                   <span className="block-number">Block {index + 1}</span>
//                   <button
//                     onClick={() => handleDeleteBlock(block.block_id)}
//                     disabled={loading}
//                     className="delete-block-button"
//                   >
//                     Delete
//                   </button>
//                 </div>

//                 <div className="block-content-row">
//                   <div className="content-editor-column">
//                     <label>Left Side</label>
//                     <select
//                       value={editState.leftIsUrl ? "url" : "paragraph"}
//                       onChange={(e) => {
//                         setEditingBlocks({
//                           ...editingBlocks,
//                           [block.block_id]: {
//                             ...editState,
//                             leftIsUrl: e.target.value === "url",
//                           },
//                         });
//                       }}
//                       className="type-select"
//                     >
//                       <option value="paragraph">Text</option>
//                       <option value="url">Image URL</option>
//                     </select>
//                     <textarea
//                       value={editState.leftContent}
//                       onChange={(e) => {
//                         setEditingBlocks({
//                           ...editingBlocks,
//                           [block.block_id]: {
//                             ...editState,
//                             leftContent: e.target.value,
//                           },
//                         });
//                       }}
//                       placeholder={
//                         editState.leftIsUrl ? "Enter image URL" : "Enter text"
//                       }
//                       className="content-textarea"
//                     />
//                   </div>

//                   <div className="content-editor-column">
//                     <label>Right Side</label>
//                     <select
//                       value={editState.rightIsUrl ? "url" : "paragraph"}
//                       onChange={(e) => {
//                         setEditingBlocks({
//                           ...editingBlocks,
//                           [block.block_id]: {
//                             ...editState,
//                             rightIsUrl: e.target.value === "url",
//                           },
//                         });
//                       }}
//                       className="type-select"
//                     >
//                       <option value="paragraph">Text</option>
//                       <option value="url">Image URL</option>
//                     </select>
//                     <textarea
//                       value={editState.rightContent}
//                       onChange={(e) => {
//                         setEditingBlocks({
//                           ...editingBlocks,
//                           [block.block_id]: {
//                             ...editState,
//                             rightContent: e.target.value,
//                           },
//                         });
//                       }}
//                       placeholder={
//                         editState.rightIsUrl ? "Enter image URL" : "Enter text"
//                       }
//                       className="content-textarea"
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}

//           {blocks.length === 0 && (
//             <p className="no-blocks">
//               No content blocks yet. Click &quot;Add Block&quot; to create one.
//             </p>
//           )}
//           <div className="header-buttons">
//             <button
//               onClick={handleAddBlock}
//               disabled={loading}
//               className="add-block-button"
//             >
//               + Add Block
//             </button>
//             <button
//               onClick={handleSaveAll}
//               disabled={loading}
//               className="save-all-button"
//             >
//               Save All Changes
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
