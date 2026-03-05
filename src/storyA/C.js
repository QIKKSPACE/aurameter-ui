import React, { useState, useMemo, useCallback } from "react";
import { View, Dimensions, Pressable, StyleSheet } from "react-native";
import DraggableLayer from "./DraggableLayer";
import CanvasToolbar from "./CanvasToolbar";
import { removeLayer } from "../../store/storyCreatorSlice";
import { useDispatch } from "react-redux";

export default function StoryCanvas({ scene, onUpdateLayer, onDeleteLayer,onPickImage,onClose,
  onAddText,onEditText,onAddMusic,selectedTrack,onRemoveTrack,onOpenStickerSheet,onAddLocation,location,onAddTag}) {
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [showGuides, setShowGuides] = useState(false);
  const dispatch=useDispatch()
  // Cache canvas height to avoid re-calculating on each render
  const canvasHeight = useMemo(() => Dimensions.get("window").height, []);
   const canvasWidth = useMemo(() => Dimensions.get("window").width, []);
const [editorLayout, setEditorLayout] = useState(null);
  // Sort layers by zIndex once per scene update
  const sortedLayers = useMemo(
    () => [...scene.layers].sort((a, b) => a.zIndex - b.zIndex),
    [scene.layers]
  ); 
  const activeLayer = useMemo(
  () => scene.layers.find(l => l.id === activeLayerId),
  [scene.layers, activeLayerId]
);

  // Memoized callbacks to prevent unnecessary re-renders of DraggableLayer
  const handleUpdateLayer = useCallback(
    (id, changes) => onUpdateLayer(id, changes),
    [onUpdateLayer]
  );

  const handleDeleteLayer = useCallback(
    (id) => onDeleteLayer(id),
    [onDeleteLayer]
  );

  const handleSelectLayer = useCallback((id) => {
    setActiveLayerId(id);
  }, []);

  const handleMoveStart = useCallback(() => setShowGuides(true), []);
  const handleMoveEnd = useCallback(() => setShowGuides(false), []);

  return (
    <View style={{ flex: 1 }}>
      {/* Background to deselect layers */}
      <Pressable
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: scene.background }}
        onPress={() => {
          setActiveLayerId(null);
          setShowGuides(false);
        }}
      />

      {/* Layers */}
      <View style={{ position: "absolute", inset: 0 }} onLayout={(e) => {
    setEditorLayout(e.nativeEvent.layout);
  }}
>
        {sortedLayers.map((layer) => (
          <MemoizedDraggableLayer
            key={layer.id}
            layer={layer}
            onUpdate={handleUpdateLayer}
            onDelete={handleDeleteLayer}
            canvasHeight={canvasHeight}
            canvasWidth={canvasWidth}
            isActive={layer.id === activeLayerId}
            onSelect={handleSelectLayer}
            onMoveStart={handleMoveStart}
            onMoveEnd={handleMoveEnd}
            onEditText={onEditText}
          />
        ))}
      </View>

      {/* Guides */}
      {showGuides && (
        <>
          <View
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "rgba(255,255,255,0.4)",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.4)",
            }}
          />
        </>
      )}

      {/* Toolbar */}
      {!showGuides && <CanvasToolbar
      location={location}
      onAddTag={onAddTag}
      onAddLocation={onAddLocation}
         editorWidth={editorLayout?.width}
    editorHeight={editorLayout?.height}
      sortedLayers={sortedLayers}
      onDelete={() => {
    if (!activeLayerId) return;
    dispatch(removeLayer(activeLayerId));
    setActiveLayerId(null);
  }}
  activeLayer={activeLayer}
  onBringToFront={() => {
    if (!activeLayer) return;

    const maxImageZ = Math.max(
      0,
      ...scene.layers
        .filter(l => l.type === "image" && l.id !== activeLayer.id)
        .map(l => l.zIndex)
    );

    onUpdateLayer(activeLayer.id, { zIndex: maxImageZ + 1 });
  }}
  onSendToBack={() => {
    if (!activeLayer) return;

    const minImageZ = Math.min(
      0,
      ...scene.layers
        .filter(l => l.type === "image" && l.id !== activeLayer.id)
        .map(l => l.zIndex)
    );

    onUpdateLayer(activeLayer.id, { zIndex: minImageZ - 1 });
  }}
  onPickImage={onPickImage}
  onAddText={onAddText}   // 👈 forward
  onAddMusic={onAddMusic}
  selectedTrack={selectedTrack}
  onRemoveTrack={onRemoveTrack}
  onOpenStickerSheet={onOpenStickerSheet}
/>}

    </View>
  );
}

/* ------------------ Memoized Draggable Layer ------------------ */
// This prevents unnecessary re-renders if props haven't changed
const MemoizedDraggableLayer = React.memo(DraggableLayer, (prev, next) => {
  return (
    prev.layer === next.layer &&
    prev.isActive === next.isActive &&
    prev.canvasHeight === next.canvasHeight
  );
});
