"use client";

import { NOTE_MAX_PHOTOS } from "@/lib/notes/constants";
import { useEffect, useRef } from "react";

export type DraftNotePhoto = {
  id: string;
  previewUrl: string;
  file?: File;
  path?: string;
};

type NotePhotoComposerProps = {
  photos: DraftNotePhoto[];
  disabled?: boolean;
  compact?: boolean;
  showButton?: boolean;
  onChange: (photos: DraftNotePhoto[]) => void;
};

export function createDraftPhoto(file: File): DraftNotePhoto {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
    previewUrl: URL.createObjectURL(file),
    file,
  };
}

export function createExistingDraftPhoto(path: string, previewUrl: string): DraftNotePhoto {
  return {
    id: path,
    previewUrl,
    path,
  };
}

export function revokeDraftPhotos(photos: DraftNotePhoto[]) {
  for (const photo of photos) {
    if (photo.file) URL.revokeObjectURL(photo.previewUrl);
  }
}

function gridClass(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 3) return "grid-cols-2 grid-rows-2";
  return "grid-cols-2";
}

export function NotePhotoComposer({
  photos,
  disabled,
  compact = false,
  showButton = true,
  onChange,
}: NotePhotoComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const remaining = NOTE_MAX_PHOTOS - photos.length;

  useEffect(() => {
    return () => revokeDraftPhotos(photosRef.current);
  }, []);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])].slice(0, remaining);
    if (files.length === 0) return;
    onChange([...photos, ...files.map(createDraftPhoto)]);
    event.target.value = "";
  };

  const removeAt = (index: number) => {
    const target = photos[index];
    if (target?.file) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((_, current) => current !== index));
  };

  return (
    <div>
      {photos.length > 0 ? (
        <div
          className={`mb-3 grid overflow-hidden rounded-2xl border border-border ${gridClass(
            photos.length,
          )} ${photos.length > 1 ? "gap-0.5" : ""} ${
            photos.length >= 2 ? (compact ? "h-40" : "h-52") : ""
          }`}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative overflow-hidden bg-border ${
                photos.length === 1 ? (compact ? "min-h-28 max-h-48" : "min-h-40 max-h-64") : ""
              } ${photos.length === 3 && index === 0 ? "row-span-2" : ""}`}
            >
              <img src={photo.previewUrl} alt="" className="size-full object-cover" />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAt(index)}
                aria-label="写真を外す"
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-50"
              >
                <i className="ti ti-x text-sm" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        disabled={disabled || remaining <= 0}
        onChange={handleSelect}
      />

      {showButton ? (
        <button
          type="button"
          disabled={disabled || remaining <= 0}
          onClick={() => inputRef.current?.click()}
          aria-label="写真を追加"
          className="flex size-9 items-center justify-center rounded-full text-accent disabled:opacity-40"
        >
          <i className="ti ti-photo text-xl" />
        </button>
      ) : null}
    </div>
  );
}
