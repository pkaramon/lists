export default abstract class Clock {
  public static inst: Clock;
  abstract now(): Date;
}
