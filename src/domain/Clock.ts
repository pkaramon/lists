export default abstract class Clock {
  public static inst: Clock = {
    now() {
      return new Date();
    },
  };
  abstract now(): Date;
}
