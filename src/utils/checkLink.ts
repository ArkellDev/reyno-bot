export default (string: string) => {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}
