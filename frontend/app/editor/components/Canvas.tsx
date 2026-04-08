'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  Stage,
  Layer,
  Image as KonvaImageNode,
  Text as KonvaTextNode,
  Rect as KonvaRectNode,
  Transformer,
} from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useEditorStore } from '@/store/editorStore';
import type { CanvasObject } from '@/types/canvas';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ObjectProps {
  obj: CanvasObject;
  isSelected: boolean;
  layerLocked: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (attrs: Partial<CanvasObject>) => void;
  onDoubleClick?: () => void;
}

function KonvaImage({ obj, isSelected, layerLocked, onSelect, onDragEnd, onTransformEnd }: ObjectProps) {
  const [image] = useImage(obj.src as string, 'anonymous');
  const nodeRef = useRef<Konva.Image>(null);

  return (
    <KonvaImageNode
      ref={nodeRef}
      id={obj.id}
      image={image}
      x={obj.x}
      y={obj.y}
      width={obj.width as number}
      height={obj.height as number}
      rotation={(obj.rotation as number) ?? 0}
      opacity={(obj.opacity as number) ?? 1}
      draggable={!layerLocked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, (obj.width as number) * scaleX),
          height: Math.max(5, (obj.height as number) * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

function KonvaText({ obj, isSelected, layerLocked, onSelect, onDragEnd, onTransformEnd, onDoubleClick }: ObjectProps) {
  const nodeRef = useRef<Konva.Text>(null);

  return (
    <KonvaTextNode
      ref={nodeRef}
      id={obj.id}
      text={obj.text as string}
      x={obj.x}
      y={obj.y}
      fontSize={(obj.fontSize as number) ?? 24}
      fontFamily={(obj.fontFamily as string) ?? 'Arial'}
      fontStyle={(obj.fontStyle as string) ?? 'normal'}
      fill={(obj.fill as string) ?? '#ffffff'}
      align={(obj.align as string) ?? 'left'}
      width={obj.width as number}
      rotation={(obj.rotation as number) ?? 0}
      opacity={(obj.opacity as number) ?? 1}
      draggable={!layerLocked}
      shadowColor={(obj.shadowColor as string) ?? undefined}
      shadowBlur={(obj.shadowBlur as number) ?? 0}
      shadowOffsetX={(obj.shadowOffsetX as number) ?? 0}
      shadowOffsetY={(obj.shadowOffsetY as number) ?? 0}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function KonvaRect({ obj, isSelected, layerLocked, onSelect, onDragEnd, onTransformEnd }: ObjectProps) {
  const nodeRef = useRef<Konva.Rect>(null);

  return (
    <KonvaRectNode
      ref={nodeRef}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      width={(obj.width as number) ?? 100}
      height={(obj.height as number) ?? 100}
      fill={(obj.fill as string) ?? '#3b82f6'}
      stroke={(obj.stroke as string) ?? undefined}
      strokeWidth={(obj.strokeWidth as number) ?? 0}
      cornerRadius={(obj.cornerRadius as number) ?? 0}
      rotation={(obj.rotation as number) ?? 0}
      opacity={(obj.opacity as number) ?? 1}
      draggable={!layerLocked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={() => {
        const node = nodeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onTransformEnd({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, (obj.width as number) * scaleX),
          height: Math.max(5, (obj.height as number) * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

// ─── Background Layer ─────────────────────────────────────────────────────────

function CanvasBackground({ width, height }: { width: number; height: number }) {
  const background = useEditorStore((s) => s.background);
  const [bgImage] = useImage(
    background.type === 'image' ? background.value : '',
    'anonymous',
  );

  if (background.type === 'color') {
    return <KonvaRectNode x={0} y={0} width={width} height={height} fill={background.value} listening={false} />;
  }

  if (background.type === 'image' && bgImage) {
    return (
      <KonvaImageNode
        x={0} y={0}
        image={bgImage}
        width={width} height={height}
        listening={false}
      />
    );
  }

  if (background.type === 'gradient') {
    // gradient stocké comme "linear,#color1,#color2"
    const parts = background.value.split(',');
    const color1 = parts[1] ?? '#1a1a2e';
    const color2 = parts[2] ?? '#16213e';
    return (
      <KonvaRectNode
        x={0} y={0} width={width} height={height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height }}
        fillLinearGradientColorStops={[0, color1, 1, color2]}
        listening={false}
      />
    );
  }

  // fallback : noir
  return <KonvaRectNode x={0} y={0} width={width} height={height} fill="#0f0f0f" listening={false} />;
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────

interface PosterCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onTextDoubleClick?: (objId: string) => void;
}

export default function PosterCanvas({ stageRef, onTextDoubleClick }: PosterCanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  const layers = useEditorStore((s) => s.layers);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const zoom = useEditorStore((s) => s.zoom);
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);
  const findObjectLayer = useEditorStore((s) => s.findObjectLayer);

  // Met à jour le Transformer quand la sélection change
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedObjectId) {
      const node = stage.findOne(`#${selectedObjectId}`);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
      } else {
        tr.nodes([]);
      }
    } else {
      tr.nodes([]);
    }
  }, [selectedObjectId, stageRef]);

  const handleSelect = useCallback(
    (objId: string) => selectObject(objId),
    [selectObject],
  );

  const handleDragEnd = useCallback(
    (objId: string, x: number, y: number) => {
      const layer = findObjectLayer(objId);
      if (layer) updateObject(layer.id, objId, { x, y });
    },
    [findObjectLayer, updateObject],
  );

  const handleTransformEnd = useCallback(
    (objId: string, attrs: Partial<CanvasObject>) => {
      const layer = findObjectLayer(objId);
      if (layer) updateObject(layer.id, objId, attrs);
    },
    [findObjectLayer, updateObject],
  );

  const renderObject = (obj: CanvasObject, layerLocked: boolean) => {
    const isSelected = obj.id === selectedObjectId;
    const props: ObjectProps = {
      obj,
      isSelected,
      layerLocked,
      onSelect: () => handleSelect(obj.id),
      onDragEnd: (x, y) => handleDragEnd(obj.id, x, y),
      onTransformEnd: (attrs) => handleTransformEnd(obj.id, attrs),
      onDoubleClick: obj.type === 'text' ? () => onTextDoubleClick?.(obj.id) : undefined,
    };

    switch (obj.type) {
      case 'image': return <KonvaImage key={obj.id} {...props} />;
      case 'text':  return <KonvaText  key={obj.id} {...props} />;
      case 'rect':  return <KonvaRect  key={obj.id} {...props} />;
      default:      return null;
    }
  };

  return (
    <div className="canvas-shadow">
      <Stage
        ref={stageRef}
        width={canvasWidth * zoom}
        height={canvasHeight * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onClick={(e) => {
          if (e.target === e.target.getStage()) selectObject(null);
        }}
        onTap={(e) => {
          if (e.target === e.target.getStage()) selectObject(null);
        }}
        style={{ display: 'block', background: '#111' }}
      >
        {/* Calque de fond (toujours en dessous) */}
        <Layer listening={false}>
          <CanvasBackground width={canvasWidth} height={canvasHeight} />
        </Layer>

        {/* Calques utilisateur (du bas vers le haut) */}
        {layers.map((layer) =>
          layer.visible ? (
            <Layer key={layer.id} name={layer.id}>
              {layer.objects.map((obj) => renderObject(obj, layer.locked))}
            </Layer>
          ) : null,
        )}

        {/* Transformer (toujours au-dessus de tout) */}
        <Layer>
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            keepRatio={false}
            borderStroke="#3b82f6"
            borderStrokeWidth={1.5}
            anchorStroke="#3b82f6"
            anchorFill="#ffffff"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateAnchorOffset={20}
            enabledAnchors={[
              'top-left', 'top-right', 'bottom-left', 'bottom-right',
              'middle-left', 'middle-right', 'top-center', 'bottom-center',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}
