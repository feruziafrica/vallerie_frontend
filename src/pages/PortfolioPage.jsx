// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useReveal, useApi } from "@/hooks";
// import { api } from '@/api/auth';

// const CATEGORY_FILTERS = [
//   { value: "all", label: "All Projects" },
//   { value: "social_media", label: "Social Media" },
//   { value: "admin", label: "Admin Support" },
//   { value: "crm", label: "CRM & Tools" },
//   { value: "project_mgmt", label: "Project Management" },
// ];

// // ── PORTFOLIO CARD ────────────────────────────────────────────────────────────
// const PortfolioCard = ({ item, onViewDetails }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5 }}
//     viewport={{ once: true, margin: "-100px" }}
//     style={{
//       borderRadius: 16,
//       overflow: "hidden",
//       boxShadow: "0 10px 40px rgba(120, 53, 15, 0.1)",
//       background: "white",
//       height: "100%",
//       display: "flex",
//       flexDirection: "column",
//       cursor: "pointer",
//       transition: "all 0.3s ease",
//     }}
//     whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(120, 53, 15, 0.2)" }}
//     onClick={() => onViewDetails(item)}
//   >
//     {/* Screenshot */}
//     <div
//       style={{
//         width: "100%",
//         height: "280px",
//         overflow: "hidden",
//         background: "var(--stone-100)",
//         position: "relative",
//       }}
//     >
//       <img
//         src={item.screenshot_url}
//         alt={item.title}
//         style={{
//           width: "100%",
//           height: "100%",
//           objectFit: "cover",
//           objectPosition: "center",
//         }}
//       />
//       {item.is_featured && (
//         <div
//           style={{
//             position: "absolute",
//             top: 12,
//             right: 12,
//             background: "var(--amber-600)",
//             color: "white",
//             padding: "6px 12px",
//             borderRadius: 6,
//             fontSize: 11,
//             fontWeight: 700,
//             letterSpacing: "0.05em",
//             textTransform: "uppercase",
//           }}
//         >
//           Featured
//         </div>
//       )}
//     </div>

//     {/* Content */}
//     <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
//       <div
//         style={{
//           fontSize: 12,
//           fontWeight: 700,
//           color: "var(--amber-700)",
//           letterSpacing: "0.1em",
//           textTransform: "uppercase",
//           marginBottom: 8,
//         }}
//       >
//         {CATEGORY_FILTERS.find((c) => c.value === item.category)?.label}
//       </div>

//       <h3
//         className="font-display"
//         style={{
//           fontSize: 20,
//           fontWeight: 600,
//           color: "var(--amber-900)",
//           marginBottom: 8,
//           lineHeight: 1.3,
//         }}
//       >
//         {item.title}
//       </h3>

//       <p
//         style={{
//           fontSize: 14,
//           color: "var(--stone-600)",
//           lineHeight: 1.6,
//           marginBottom: 16,
//           flex: 1,
//         }}
//       >
//         {item.short_description}
//       </p>

//       {item.result && (
//         <div
//           style={{
//             padding: "12px",
//             background: "var(--amber-50)",
//             borderRadius: 8,
//             border: "1px solid var(--amber-200)",
//             marginBottom: 16,
//           }}
//         >
//           <div style={{ fontSize: 11, color: "var(--stone-500)", marginBottom: 2 }}>
//             Result
//           </div>
//           <div
//             style={{
//               fontSize: 13,
//               fontWeight: 600,
//               color: "var(--amber-900)",
//             }}
//           >
//             {item.result}
//           </div>
//         </div>
//       )}

//       <div style={{ display: "flex", gap: 8 }}>
//         <button
//           style={{
//             flex: 1,
//             padding: "10px 16px",
//             background: "var(--amber-600)",
//             color: "white",
//             border: "none",
//             borderRadius: 8,
//             fontSize: 13,
//             fontWeight: 600,
//             cursor: "pointer",
//             transition: "background 0.2s",
//           }}
//           onMouseEnter={(e) => (e.target.style.background = "var(--amber-700)")}
//           onMouseLeave={(e) => (e.target.style.background = "var(--amber-600)")}
//           onClick={(e) => {
//             e.stopPropagation();
//             onViewDetails(item);
//           }}
//         >
//           View Details
//         </button>
//         {item.has_download && (
//           <button
//             style={{
//               padding: "10px 16px",
//               background: "transparent",
//               color: "var(--amber-600)",
//               border: "1.5px solid var(--amber-600)",
//               borderRadius: 8,
//               fontSize: 13,
//               fontWeight: 600,
//               cursor: "pointer",
//               transition: "all 0.2s",
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.background = "var(--amber-50)";
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.background = "transparent";
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               downloadPortfolioItem(item.id);
//             }}
//             title="Download case study or project file"
//           >
//             ⬇️ Download
//           </button>
//         )}
//       </div>
//     </div>
//   </motion.div>
// );

// // ── PORTFOLIO MODAL / DETAIL VIEW ──────────────────────────────────────────────
// const PortfolioModal = ({ item, onClose }) => {
//   const [downloading, setDownloading] = useState(false);

//   const handleDownload = async () => {
//     setDownloading(true);
//     try {
//       await downloadPortfolioItem(item.id);
//     } finally {
//       setDownloading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(28, 25, 23, 0.8)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 9999,
//         padding: "20px",
//         overflow: "auto",
//       }}
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           background: "white",
//           borderRadius: 24,
//           overflow: "hidden",
//           maxWidth: 900,
//           width: "100%",
//           maxHeight: "90vh",
//           overflowY: "auto",
//           boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
//         }}
//       >
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           style={{
//             position: "absolute",
//             top: 20,
//             right: 20,
//             background: "white",
//             border: "none",
//             width: 40,
//             height: 40,
//             borderRadius: "50%",
//             fontSize: 24,
//             cursor: "pointer",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//             zIndex: 10,
//           }}
//         >
//           ✕
//         </button>

//         {/* Screenshot */}
//         <img
//           src={item.screenshot_url}
//           alt={item.title}
//           style={{
//             width: "100%",
//             height: "auto",
//             maxHeight: "400px",
//             objectFit: "cover",
//           }}
//         />

//         {/* Content */}
//         <div style={{ padding: "40px" }}>
//           <div
//             style={{
//               fontSize: 12,
//               fontWeight: 700,
//               color: "var(--amber-700)",
//               letterSpacing: "0.1em",
//               textTransform: "uppercase",
//               marginBottom: 8,
//             }}
//           >
//             {CATEGORY_FILTERS.find((c) => c.value === item.category)?.label}
//           </div>

//           <h1
//             className="font-display"
//             style={{
//               fontSize: "clamp(28px, 5vw, 42px)",
//               fontWeight: 600,
//               color: "var(--amber-900)",
//               marginBottom: 8,
//               lineHeight: 1.2,
//             }}
//           >
//             {item.title}
//           </h1>

//           {item.client_name && (
//             <p
//               style={{
//                 fontSize: 14,
//                 color: "var(--amber-700)",
//                 fontWeight: 500,
//                 marginBottom: 24,
//               }}
//             >
//               Client: <strong>{item.client_name}</strong>
//             </p>
//           )}

//           <p
//             style={{
//               fontSize: 16,
//               lineHeight: 1.8,
//               color: "var(--stone-600)",
//               marginBottom: 28,
//               fontWeight: 300,
//             }}
//           >
//             {item.description}
//           </p>

//           {/* Project Details Grid */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//               gap: 20,
//               marginBottom: 32,
//               padding: 24,
//               background: "var(--amber-50)",
//               borderRadius: 16,
//               border: "1px solid var(--amber-200)",
//             }}
//           >
//             {item.services_used && (
//               <div>
//                 <div
//                   style={{
//                     fontSize: 12,
//                     fontWeight: 700,
//                     color: "var(--amber-700)",
//                     letterSpacing: "0.08em",
//                     textTransform: "uppercase",
//                     marginBottom: 8,
//                   }}
//                 >
//                   Services
//                 </div>
//                 <div style={{ fontSize: 14, color: "var(--stone-700)", lineHeight: 1.6 }}>
//                   {item.services_used.split(",").map((s, i) => (
//                     <div key={i}>{s.trim()}</div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {item.result && (
//               <div>
//                 <div
//                   style={{
//                     fontSize: 12,
//                     fontWeight: 700,
//                     color: "var(--amber-700)",
//                     letterSpacing: "0.08em",
//                     textTransform: "uppercase",
//                     marginBottom: 8,
//                   }}
//                 >
//                   Result
//                 </div>
//                 <div style={{ fontSize: 14, color: "var(--amber-900)", fontWeight: 600 }}>
//                   {item.result}
//                 </div>
//               </div>
//             )}

//             {item.project_date && (
//               <div>
//                 <div
//                   style={{
//                     fontSize: 12,
//                     fontWeight: 700,
//                     color: "var(--amber-700)",
//                     letterSpacing: "0.08em",
//                     textTransform: "uppercase",
//                     marginBottom: 8,
//                   }}
//                 >
//                   Completed
//                 </div>
//                 <div style={{ fontSize: 14, color: "var(--stone-700)" }}>
//                   {new Date(item.project_date).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "long",
//                   })}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
//             {item.project_link && (
//               <a
//                 href={item.project_link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={{
//                   padding: "14px 32px",
//                   background: "var(--amber-600)",
//                   color: "white",
//                   border: "none",
//                   borderRadius: 10,
//                   fontSize: 15,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                   textDecoration: "none",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 8,
//                   transition: "all 0.2s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.background = "var(--amber-700)";
//                   e.target.style.boxShadow = "0 6px 20px rgba(180, 83, 9, 0.3)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.background = "var(--amber-600)";
//                   e.target.style.boxShadow = "none";
//                 }}
//               >
//                 Visit Project →
//               </a>
//             )}

//             {item.has_download && (
//               <button
//                 onClick={handleDownload}
//                 disabled={downloading}
//                 style={{
//                   padding: "14px 32px",
//                   background: "transparent",
//                   color: "var(--amber-600)",
//                   border: "2px solid var(--amber-600)",
//                   borderRadius: 10,
//                   fontSize: 15,
//                   fontWeight: 700,
//                   cursor: downloading ? "not-allowed" : "pointer",
//                   transition: "all 0.2s",
//                   opacity: downloading ? 0.7 : 1,
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!downloading) e.target.style.background = "var(--amber-50)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.background = "transparent";
//                 }}
//               >
//                 {downloading ? "Downloading…" : "⬇️ Download Case Study"}
//               </button>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // ── DOWNLOAD HELPER ────────────────────────────────────────────────────────────
// const downloadPortfolioItem = async (itemId) => {
//   try {
//     const response = await api.get(
//       `/api/portfolio/${itemId}/download/`,
//       {
//         responseType: "blob",
//       }
//     );

//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       response.headers["content-disposition"]?.split("filename=")[1] || "portfolio_file"
//     );
//     document.body.appendChild(link);
//     link.click();
//     link.parentNode.removeChild(link);
//   } catch (error) {
//     console.error("Download failed:", error);
//     alert("Failed to download file. Please try again.");
//   }
// };

// // ── MAIN PORTFOLIO COMPONENT ──────────────────────────────────────────────────
// const Portfolio = () => {
//   const [ref, inView] = useReveal();
//   const [portfolioItems, setPortfolioItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchPortfolioItems();
//   }, []);

//   const fetchPortfolioItems = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/api/portfolio/');
//       setPortfolioItems(response.data);
//       setError(null);
//     } catch (err) {
//       console.error("Failed to fetch portfolio:", err);
//       setError("Failed to load portfolio items");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredItems =
//     selectedCategory === "all"
//       ? portfolioItems
//       : portfolioItems.filter((item) => item.category === selectedCategory);

//   return (
//     <section
//       id="portfolio"
//       ref={ref}
//       style={{
//         padding: "clamp(60px, 10vw, 120px) clamp(20px, 5vw, 48px)",
//         background: "var(--cream)",
//         width: "100%",
//         boxSizing: "border-box",
//       }}
//     >
//       <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={inView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.7 }}
//           style={{ marginBottom: 60, textAlign: "center" }}
//         >
//           <div className="section-label" style={{ marginBottom: 24, justifyContent: "center" }}>
//             Latest Work
//           </div>
//           <h2
//             className="font-display"
//             style={{
//               fontSize: "clamp(28px, 5.5vw, 52px)",
//               fontWeight: 600,
//               color: "var(--amber-900)",
//               letterSpacing: "-0.02em",
//               lineHeight: 1.15,
//               marginBottom: 16,
//             }}
//           >
//             Proven Results Across Industries
//           </h2>
//           <p
//             style={{
//               fontSize: "clamp(14px, 3.5vw, 16px)",
//               color: "var(--stone-600)",
//               maxWidth: 600,
//               margin: "0 auto",
//               lineHeight: 1.8,
//             }}
//           >
//             Check out some of our latest projects and see how I've helped businesses streamline
//             operations and scale growth.
//           </p>
//         </motion.div>

//         {/* Category Filter */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={inView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.7, delay: 0.1 }}
//           style={{
//             display: "flex",
//             gap: 12,
//             justifyContent: "center",
//             flexWrap: "wrap",
//             marginBottom: 60,
//           }}
//         >
//           {CATEGORY_FILTERS.map((cat) => (
//             <button
//               key={cat.value}
//               onClick={() => setSelectedCategory(cat.value)}
//               style={{
//                 padding: "10px 20px",
//                 borderRadius: 25,
//                 border: "1.5px solid var(--amber-400)",
//                 background:
//                   selectedCategory === cat.value ? "var(--amber-600)" : "transparent",
//                 color:
//                   selectedCategory === cat.value ? "white" : "var(--amber-700)",
//                 fontSize: 13,
//                 fontWeight: 600,
//                 cursor: "pointer",
//                 transition: "all 0.25s",
//               }}
//               onMouseEnter={(e) => {
//                 if (selectedCategory !== cat.value) {
//                   e.target.style.background = "var(--amber-50)";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (selectedCategory !== cat.value) {
//                   e.target.style.background = "transparent";
//                 }
//               }}
//             >
//               {cat.label}
//             </button>
//           ))}
//         </motion.div>

//         {/* Loading State */}
//         {loading && (
//           <div style={{ textAlign: "center", padding: "60px 20px" }}>
//             <p style={{ color: "var(--stone-500)" }}>Loading portfolio items...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <div
//             style={{
//               padding: "20px",
//               background: "#fef2f2",
//               border: "1px solid #fecaca",
//               borderRadius: 12,
//               color: "#dc2626",
//               marginBottom: 40,
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {/* Portfolio Grid */}
//         {!loading && filteredItems.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={inView ? { opacity: 1 } : {}}
//             transition={{ duration: 0.7, delay: 0.2 }}
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(clamp(280px, 30%, 380px), 1fr))",
//               gap: "clamp(20px, 3vw, 32px)",
//               width: "100%",
//             }}
//           >
//             {filteredItems.map((item) => (
//               <PortfolioCard
//                 key={item.id}
//                 item={item}
//                 onViewDetails={setSelectedItem}
//               />
//             ))}
//           </motion.div>
//         )}

//         {/* Empty State */}
//         {!loading && filteredItems.length === 0 && (
//           <div style={{ textAlign: "center", padding: "60px 20px" }}>
//             <p style={{ color: "var(--stone-500)", fontSize: 16 }}>
//               No projects found in this category yet.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Modal Detail View */}
//       {selectedItem && (
//         <PortfolioModal
//           item={selectedItem}
//           onClose={() => setSelectedItem(null)}
//         />
//       )}
//     </section>
//   );
// };

// export default Portfolio;