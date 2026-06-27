export const chordDescriptions: Record<
  string,
  {
    basic: string;
    advanced: string;
    mood: string[];
    commonProgressions: string[];
  }
> = {
  A: {
    basic:
      "A major는 A, C#, E로 이루어진 장화음이다. 밝고 안정적인 느낌이 강하다.",
    advanced:
      "A major는 A 장조에서 I, D 장조에서 V, E 장조에서 IV로 기능할 수 있다. 즉 같은 A 코드라도 조성 안에서 토닉, 도미넌트, 서브도미넌트 역할이 달라진다.",
    mood: ["밝음", "안정", "직선적", "팝/록 친화적"],
    commonProgressions: [
      "A - D - E",
      "A - F#m - D - E",
      "A - C#m - F#m - D",
    ],
  },

  Am: {
    basic:
      "A minor는 A, C, E로 이루어진 단화음이다. 어둡고 차분한 느낌이 난다.",
    advanced:
      "A minor는 A 단조에서는 i, C 장조에서는 vi로 작동한다. 단조에서는 중심 코드이고, 장조에서는 감정을 부드럽게 낮추는 코드로 자주 쓰인다.",
    mood: ["어두움", "차분함", "쓸쓸함", "감정적"],
    commonProgressions: [
      "Am - F - C - G",
      "Am - G - F - E",
      "Am - Dm - G - C",
    ],
  },

  A7: {
    basic:
      "A7은 A, C#, E, G로 이루어진 도미넌트 세븐스 코드다. A major에 단7도 G가 더해져 긴장감이 생긴다.",
    advanced:
      "A7은 D 또는 Dm으로 해결하려는 성질이 강하다. A 장조 안에서는 I7처럼 블루지하게 쓸 수 있고, D 장조에서는 V7로 정석적인 도미넌트 기능을 한다.",
    mood: ["블루지", "긴장", "거칠음", "해결 욕구"],
    commonProgressions: [
      "A7 - D",
      "A7 - Dm",
      "A - A7 - D - Dm",
    ],
  },

  Amaj7: {
    basic:
      "Amaj7은 A, C#, E, G#로 이루어진 메이저 세븐스 코드다. 밝지만 그냥 A보다 더 부드럽고 세련된 느낌이 난다.",
    advanced:
      "Amaj7은 A 장조에서 Imaj7로 안정적인 중심 역할을 한다. 재즈, 시티팝, 네오소울에서는 9, 13, #11 같은 텐션을 얹어 색채를 확장하기 좋다.",
    mood: ["세련됨", "부드러움", "몽환적", "시티팝"],
    commonProgressions: [
      "Amaj7 - Dmaj7",
      "Amaj7 - C#m7 - F#m7 - Dmaj7",
      "Amaj7 - C#7 - F#m7 - B7",
    ],
  },
};