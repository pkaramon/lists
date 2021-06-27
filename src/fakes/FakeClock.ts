import Clock from "../domain/Clock";

export default class FakeClock implements Clock {
  constructor(private props: { currentTime: Date }) {}
  now(): Date {
    return this.props.currentTime;
  }
}
