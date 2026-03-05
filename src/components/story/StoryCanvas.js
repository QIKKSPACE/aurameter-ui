import React, { useState, useMemo, useCallback } from "react";
import { View, Pressable, StyleSheet, Dimensions } from "react-native";
import { useDispatch } from "react-redux";
import DraggableLayer from "./DraggableLayer";
import CanvasToolbar from "./CanvasToolbar";
import { removeLayer } from "../../store/storyCreatorSlice";

/* ───────────────── DESIGN SPACE ───────────────── */
const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

export default function StoryCanvas({
  scene,
  onUpdateLayer,
  onDeleteLayer,
  onPickImage,
  onClose,
  onAddText,
  onEditText,  
  onAddMusic,
  selectedTrack,
  onRemoveTrack,
  onOpenStickerSheet,
  onAddLocation,
  location,
  onAddTag,
  handlePreparePost
}) {
  const dispatch = useDispatch();

  const [activeLayerId, setActiveLayerId] = useState(null);
  const [showGuides, setShowGuides] = useState(false);
  const [editorLayout, setEditorLayout] = useState(null);

  /* ───────────────── SCALE (VIEW ONLY) ───────────────── */
  const editorScale = useMemo(() => {
    if (!editorLayout) return 1;
    return Math.min(
      editorLayout.width / DESIGN_WIDTH,
      editorLayout.height / DESIGN_HEIGHT
    );
  }, [editorLayout]);

  /* ───────────────── SORT LAYERS ───────────────── */
  const sortedLayers = useMemo(
    () => [...scene.layers].sort((a, b) => a.zIndex - b.zIndex),
    [scene.layers]
  );

  const activeLayer = useMemo(
    () => scene.layers.find(l => l.id === activeLayerId),
    [scene.layers, activeLayerId]
  );

  /* ───────────────── CALLBACKS ───────────────── */
  const handleSelectLayer = useCallback((id) => {
    setActiveLayerId(id);
  }, []);

  const handleMoveStart = useCallback(() => setShowGuides(true), []);
  const handleMoveEnd = useCallback(() => setShowGuides(false), []);

  /* ───────────────── RENDER ───────────────── */
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Background (deselect) */}
      <Pressable
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: scene.background },
        ]}
        onPress={() => {
          setActiveLayerId(null);
          setShowGuides(false);
        }}
      />

      {/* Editor surface */}
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
        onLayout={(e) => setEditorLayout(e.nativeEvent.layout)}
      >
        {/* Design canvas */}
        <View
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: [{ scale: editorScale }],
          }}
        >
          {sortedLayers.map(layer => (
            <MemoizedDraggableLayer
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              onSelect={handleSelectLayer}
              onUpdate={onUpdateLayer}
              onDelete={onDeleteLayer}
              onMoveStart={handleMoveStart}
              onMoveEnd={handleMoveEnd}
              onEditText={onEditText}
              editorScale={editorScale}
              canvasWidth={DESIGN_WIDTH}
              canvasHeight={DESIGN_HEIGHT}
            />
          ))}
        </View>
      </View>

      {/* Alignment guides */}
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
      {!showGuides && (
        <CanvasToolbar
          location={location}
          onAddTag={onAddTag}
          editorScale={editorScale}
          onAddLocation={onAddLocation}
          editorWidth={editorLayout?.width}
          editorHeight={editorLayout?.height}
          sortedLayers={sortedLayers}
          activeLayer={activeLayer}
          onDelete={() => {
            if (!activeLayerId) return;
            dispatch(removeLayer(activeLayerId));
            setActiveLayerId(null);
          }}
          onBringToFront={() => {
            if (!activeLayer) return;
            const maxZ = Math.max(
              0,
              ...scene.layers
                .filter(l => l.id !== activeLayer.id)
                .map(l => l.zIndex)
            );
            onUpdateLayer(activeLayer.id, { zIndex: maxZ + 1 });
          }}
          onSendToBack={() => {
            if (!activeLayer) return;
            const minZ = Math.min(
              0,
              ...scene.layers
                .filter(l => l.id !== activeLayer.id)
                .map(l => l.zIndex)
            );
            onUpdateLayer(activeLayer.id, { zIndex: minZ - 1 });
          }}
          onPickImage={onPickImage}
          onAddText={onAddText}
          onAddMusic={onAddMusic}
          selectedTrack={selectedTrack}
          onRemoveTrack={onRemoveTrack}
          onOpenStickerSheet={onOpenStickerSheet}
          handlePreparePost={handlePreparePost}
        />
      )}
    </View>
  );
}

/* ───────────────── MEMO ───────────────── */
const MemoizedDraggableLayer = React.memo(
  DraggableLayer,
  (prev, next) =>
    prev.layer === next.layer &&
    prev.isActive === next.isActive &&
    prev.editorScale === next.editorScale
);
