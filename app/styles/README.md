# CSS Styles Structure

Organizace CSS stylů podle Next.js a Tailwind CSS v4.1 best practices.

## 📁 Struktura

```
app/styles/
├── components/           # @layer components - UI komponenty
│   ├── index.css        # Centrální import všech komponent
│   ├── sidebar.css      # Sidebar komponenty
│   ├── chat.css         # Chat komponenty (budoucí)
│   ├── buttons.css      # Button varianty (budoucí)
│   └── forms.css        # Form styly (budoucí)
├── utilities/           # @layer utilities - custom utility třídy
└── README.md           # Tato dokumentace
```

## 🎯 Konvence

### Komponenty CSS soubory
- Používají `@layer components` pro Tailwind komponenty
- Každý soubor obsahuje logicky seskupené komponenty
- Názvy tříd používají kebab-case: `.sidebar-base`, `.chat-message`

### Importy
- Všechny komponenty se importují přes `components/index.css`
- `globals.css` importuje pouze `components/index.css`
- Zachovává čistotu a přehlednost

### Příklad komponenty

```css
/* components/sidebar.css */
@layer components {
  .sidebar-base {
    @apply bg-black/20 backdrop-blur-xl border-r border-white/10;
  }
  
  .sidebar-header {
    @apply bg-gradient-to-b from-black/30 to-black/20;
  }
}
```

## 📊 Výhody této struktury

- ✅ **Škálovatelnost**: Snadné přidávání nových komponent
- ✅ **Přehlednost**: Každá komponenta má vlastní soubor
- ✅ **Maintenance**: Snadné nalezení a úprava stylů
- ✅ **Performance**: Tailwind optimalizuje při buildu
- ✅ **IntelliSense**: Lepší autocomplete pro CSS třídy

## 🚀 Použití

```tsx
// V komponentách použijte CSS třídy
<div className="sidebar-base">
  <header className="sidebar-header">
    <div className="sidebar-logo">
```

## 📝 Přidání nové komponenty

1. Vytvořte nový CSS soubor: `components/new-component.css`
2. Přidejte import do `components/index.css`
3. Definujte komponenty s `@layer components`
4. Používejte třídy v React komponentách
