/** Grava no localStorage sem derrubar o app se o espaço acabar. */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`Não foi possível salvar "${key}" no aparelho:`, err);
    return false;
  }
}
