export type Point = { x: number; y: number };

export const SLACK_LENGTH = 400;

/** The decline distance between the mid and spring point vertically */
export const slackDecline = (point1: Point, point2: Point) => {
  const distance =
    SLACK_LENGTH -
    Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
  return Math.max(Math.min(SLACK_LENGTH, distance), 0);
};

const timeInterval = 0.2;
const gravity = 9.8;
let velocity = { x: 0, y: 0 };

/**
 * Calculates a new position (curved point) for any given time to simulate a spring animation.
 *
 * reference:- https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations/
 *
 * @param oldPosition Last calculated value.
 * @param anchor midpoint that connects the endpoints.
 * @param stiffness extent to which an object resists deformation in response to an applied force.
 * @param mass A measure of the amount of matter contained in or constituting any given object.
 * @param damping The force that slows down and eventually stops an oscillation by dissipating energy
 * @returns New point for a spirng at any given time.
 */
export const calculateSpringPoint = (
  oldPosition: Point,
  anchor: Point,
  stiffness: number,
  mass: number,
  damping: number,
) => {
  /* Spring stiffness, in kg / s^2 */
  let k = -stiffness;

  /* Damping constant, in kg / s */
  /* damping Force = negative damping * velocity */
  let xDampingForce = -damping * velocity.x;
  let yDampingForce = -damping * velocity.y;

  // Spring force
  // force = negative stiffness * displacement
  let xSpringForce = k * (oldPosition.x - anchor.x);
  let ySpringForce = k * (oldPosition.y - anchor.y);

  // Total Force (damping will be negative here)
  let forceX = xSpringForce + xDampingForce;
  let forceY = ySpringForce + mass * gravity + yDampingForce;

  // acceleration = force / mass
  let ax = forceX / mass;
  let ay = forceY / mass;

  // New velocity = old velocity + acceleration * time interval
  let vx = velocity.x + ax * timeInterval;
  let vy = velocity.y + ay * timeInterval;
  velocity = { x: vx, y: vy };

  // New position = old position + velocity * time interval
  let positionX = oldPosition.x + vx * timeInterval;
  let positionY = oldPosition.y + vy * timeInterval;

  return { x: positionX, y: positionY };
};
