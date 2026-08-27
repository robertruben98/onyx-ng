import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

const STATUS_LABELS: Record<AvatarStatus, string> = {
  online: "Online",
  offline: "Offline",
  away: "Away",
  busy: "Busy",
};

/**
 * User avatar. Shows an image when `src` resolves, otherwise initials derived
 * from `name`. The initials fallback exposes `role=img` + `aria-label`; the
 * decorative letters are hidden from assistive tech. An optional `status` dot
 * conveys presence and is announced with its own label.
 */
@Component({
  selector: "onyx-avatar",
  standalone: true,
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.ui-avatar]": "true",
    "[class.ui-avatar--sm]": "size() === 'sm'",
    "[class.ui-avatar--lg]": "size() === 'lg'",
    "[class.ui-avatar--square]": "shape() === 'square'",
  },
})
export class OnyxAvatarComponent {
  /** Image source URL. */
  readonly src = input("");
  /** Person name — used for the image alt text and initials fallback. */
  readonly name = input("");
  /** Avatar size. */
  readonly size = input<AvatarSize>("md");
  /** Avatar shape. */
  readonly shape = input<AvatarShape>("circle");
  /** Presence status — renders a colored dot when set. */
  readonly status = input<AvatarStatus | null>(null);

  /** Whether the image failed to load. */
  protected readonly imgError = signal(false);

  /** Show initials when there is no image or it failed. */
  protected readonly showInitials = computed(
    () => !this.src() || this.imgError(),
  );

  /** Up-to-two-letter initials derived from the name. */
  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "";
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  });

  /** Human-readable label for the status dot, announced to assistive tech. */
  protected readonly statusLabel = computed(() => {
    const status = this.status();
    return status ? STATUS_LABELS[status] : null;
  });
}
