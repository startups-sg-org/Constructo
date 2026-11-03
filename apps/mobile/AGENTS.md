# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# UI Craft & Design System (Anti-AI Slop)

Ao implementar telas ou componentes nesta aplicação mobile:
1. **Consulte e obedeça rigorosamente a Skill de UI Craft:** `.agents/skills/ui-craft/SKILL.md` (ou `.antigravity/skills/ui-craft.md`).
2. **Componentes Primitivos Trancados:** Não crie botões, inputs ou cards soltos com estilos arbitrários nas telas de feature. Utilize sempre os componentes base de `@/components/ui/` (`Button`, `Card`, `Typography`, `Input`, `Badge`).
3. **Física e Micro-interações:** Toda ação primária e card clicável deve possuir física tátil de escala com `react-native-reanimated` (`withSpring(0.96)`).
4. **Cores e Identidade:** Respeite a paleta oficial do Constructo (fundo `#F5F7F6`, primária `#236557`, acento `#B97200`, bordas `#DFE5E3`).

