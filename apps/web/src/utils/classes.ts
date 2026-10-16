export type ClasseCondicional = string | false | null | undefined;

export function cn(...classes: ClasseCondicional[]): string {
    return classes.filter(Boolean).join(" ");
}
