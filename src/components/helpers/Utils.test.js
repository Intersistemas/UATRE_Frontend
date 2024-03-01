import {
	and,
	id,
	iff,
	looselyEqual,
	not,
	or,
	pass,
	same,
	same0,
	strictlyEqual,
	xor,
} from "./Utils";

console.log(
	"logic unary operations",
	pass(
		[
			{ in: false, ok: { id: false, not: true } },
			{ in: null, ok: { id: false, not: true } },
			{ in: undefined, ok: { id: false, not: true } },
			{ in: 0, ok: { id: false, not: true } },
			{ in: "", ok: { id: false, not: true } },
			{ in: true, ok: { id: true, not: false } },
			{ in: {}, ok: { id: true, not: false } },
			{ in: 1, ok: { id: true, not: false } },
			{ in: "0", ok: { id: true, not: false } },
			{ in: () => false, ok: { id: false, not: true } },
			{ in: () => null, ok: { id: false, not: true } },
			{ in: () => undefined, ok: { id: false, not: true } },
			{ in: () => {}, ok: { id: false, not: true } },
			{ in: () => 0, ok: { id: false, not: true } },
			{ in: () => "", ok: { id: false, not: true } },
			{ in: () => true, ok: { id: true, not: false } },
			{ in: () => ({}), ok: { id: true, not: false } },
			{ in: () => 1, ok: { id: true, not: false } },
			{ in: () => "0", ok: { id: true, not: false } },
		].map(({ in: input, ok }) => {
			const out = {
				id: id(input),
				not: not(input),
			};
			const test = {
				id: out.id === ok.id,
				not: out.not === ok.not,
			};
			return {
				pass: test.id && test.not,
				in: input,
				ok,
				out,
				test,
			};
		})
	),
);

console.log(
	"logic n-ary operations",
	pass(
		[
			{
				in: [false, null, undefined, 0, "", () => {}],
				ok: { or: false, and: false, xor: false, iff: true },
			},
			{
				in: [false, null, undefined, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, undefined, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, null, {}, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, undefined, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [false, {}, {}, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{ 
				in: [true, null, undefined, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, undefined, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, null, {}, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, undefined, 1, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 0, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 0, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 0, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 0, "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 1, "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 1, "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 1, "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [true, {}, {}, 1, "1", () => ({})],
				ok: { or: true, and: true, xor: false, iff: true },
			},
			{
				in: [() => false, () => null, () => undefined, () => 0, () => "", () => {}],
				ok: { or: false, and: false, xor: false, iff: true },
			},
			{
				in: [() => false, () => null, () => undefined, () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => undefined, () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => null, () => ({}), () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => undefined, () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => false, () => ({}), () => ({}), () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => undefined, () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => null, () => ({}), () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => undefined, () => 1, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 0, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 0, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 0, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 0, () => "1", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 1, () => "", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 1, () => "", () => ({})],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 1, () => "1", () => {}],
				ok: { or: true, and: false, xor: true, iff: false },
			},
			{
				in: [() => true, () => ({}), () => ({}), () => 1, () => "1", () => ({})],
				ok: { or: true, and: true, xor: false, iff: true },
			},
		].map(({ in: input, ok }) => {
			const out = {
				or: or(...input),
				and: and(...input),
				xor: xor(...input),
				iff: iff(...input),
			};
			const test = {
				or: out.or === ok.or,
				and: out.and === ok.and,
				xor: out.xor === ok.xor,
				iff: out.iff === ok.iff,
			};
			return {
				pass: test.or && test.and && test.xor && test.iff,
				in: input,
				ok,
				out,
				test,
			};
		})
	),
);

console.log(
	"equality",
	pass(
		[
			{
				in: [undefined, undefined],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [null, null],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [true, true],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [false, false],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: ["foo", "foo"],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [0, 0],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [+0, -0],
				ok: { loosey: true, strict: true, same: false, same0: true },
			},
			{
				in: [+0, 0],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [-0, 0],
				ok: { loosey: true, strict: true, same: false, same0: true },
			},
			{
				in: [0n, -0n],
				ok: { loosey: true, strict: true, same: true, same0: true },
			},
			{
				in: [0, false],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: ["", false],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: ["", 0],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: ["0", 0],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: [[1, 2], "1,2"],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: [new String("foo"), "foo"],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: [null, undefined],
				ok: { loosey: true, strict: false, same: false, same0: false },
			},
			{
				in: [null, false],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [undefined, false],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [{ foo: "bar" }, { foo: "bar" }],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [new String("foo"), new String("foo")],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [0, null],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [0, NaN],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: ["foo", NaN],
				ok: { loosey: false, strict: false, same: false, same0: false },
			},
			{
				in: [NaN, NaN],
				ok: { loosey: false, strict: false, same: true, same0: true },
			},
		].map(({ in: input, ok }) => {
			const out = {
				loosey: looselyEqual(...input),
				strict: strictlyEqual(...input),
				same: same(...input),
				same0: same0(...input),
			};
			const test = {
				loosey: out.loosey === ok.loosey,
				strict: out.strict === ok.strict,
				same: out.same === ok.same,
				same0: out.same0 === ok.same0,
			};
			return {
				pass: test.loosey && test.strict && test.same && test.same0,
				in: input,
				ok,
				out,
				test,
			};
		})
	)
);
