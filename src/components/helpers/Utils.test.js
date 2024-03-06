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
		...[
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
		...[
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
		...[
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

console.log(
	"https://en.wikipedia.org/wiki/Logical_equivalence",
	pass(...[false, true].map((p) => ({
		p,
		...pass(
			{
				name: "Identity laws",
				...pass(
					{ name: "p and true <=> p", pass: iff(and(p, true), p) },
					{ name: "p or false <=> p", pass: iff(or(p, false), p) }
				)
			},
			{
				name: "Domain laws",
				...pass(
					{ name: "p or true <=> true", pass: iff(or(p, true), true) },
					{ name: "p and false <=> false", pass: iff(and(p, false), false) }
				)
			},
			{
				name: "Idempotent laws",
				...pass(
					{ name: "p or p <=> p", pass: iff(or(p, p), p) },
					{ name: "p and p <=> p", pass: iff(and(p, p), p) }
				)
			},
			{
				name: "Double negation law",
				...pass(
					{ name: "--p <=> p", pass: iff(not(not(p)), p) }
				)
			},
			{
				name: "Commutative laws",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(
						{ name: "p or q <=> q or p", pass: iff(or(p, q), or(q, p)) },
						{ name: "p and q <=> q and p", pass: iff(and(p, q), and(q, p)) }
					)
				})))
			},
			{
				name: "Associative laws",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(...[false, true].map((r) => ({
						r,
						...pass(
							{ name: "(p or q) or r <=> p or (q or r)", pass: iff(or(or(p, q), r), or(p, or(q, r))) },
							{ name: "(p and q) and r <=> p and (q and r)", pass: iff(and(and(p, q), r), and(p, and(q, r))) }
						)
					})))
				})))
			},
			{
				name: "Distributive laws",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(...[false, true].map((r) => ({
						r,
						...pass(
							{ name: "p or (q and r) <=> (p or q) and (p or r)", pass: iff(or(p, and(q, r)), and(or(p, q), or(p, r))) },
							{ name: "p and (q or r) <=> (p and q) or (p and r)", pass: iff(and(p, or(q, r)), or(and(p, q), and(p, r))) }
						)
					})))
				})))
			},
			{
				name: "De Morgan's laws",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(
						{ name: "-(p and q) <=> -p or -q", pass: iff(not(and(p, q)), or(not(p), not(q))) },
						{ name: "-(p or q) <=> -p and -q", pass: iff(not(or(p, q)), and(not(p), not(q))) }
					)
				})))
			},
			{
				name: "Absorption laws",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(
						{ name: "p or (p and q) <=> p", pass: iff(or(p, and(p, q)), p) },
						{ name: "p and (p or q) <=> p", pass: iff(and(p, or(p, q)), p) }
					)
				})))
			},
			{
				name: "Negation laws",
				...pass(
					{ name: "p or -p <=> true", pass: iff(or(p, not(p)), true) },
					{ name: "p and -p <=> false", pass: iff(and(p, not(p)), false) }
				)
			},
			{
				name: "Logical equivalences involving conditional statements",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(
						{ name: "p -> q <=> -p or q", pass: iff(then(p, q), or(not(p), q)) },
						{ name: "p -> q <=> -q -> -p", pass: iff(then(p, q), then(not(q), not(p))) },
						{ name: "p or q <=> -p -> q", pass: iff(or(p, q), then(not(p), q)) },
						{ name: "p and q <=> -(p -> -q)", pass: iff(and(p, q), not(then(p, not(q)))) },
						{ name: "-(p -> q) <=> p and -q", pass: iff(not(then(p, q)), and(p, not(q))) },
						pass(...[false, true].map((r) => ({
							r,
							...pass(
								{ name: "(p -> q) and (p -> r) <=> p -> (q and r)", pass: iff(and(then(p, q), then(p, r)), then(p, and(q, r))) },
								{ name: "(p -> q) or (p -> r) <=> p -> (q or r)", pass: iff(or(then(p, q), then(p, r)), then(p, or(q, r))) },
								{ name: "(p -> t) and (q -> r) <=> (p or q) -> r", pass: iff(and(then(p, r), then(q, r)), then(or(p, q), r)) },
								{ name: "(p -> t) or (q -> r) <=> (p and q) -> r", pass: iff(or(then(p, r), then(q, r)), then(and(p, q), r)) }
							)
						})))
					)
				})))
			},
			{
				name: "Logical equivalences involving biconditionals",
				...pass(...[false, true].map((q) => ({
					q,
					...pass(
						{ name: "p <-> q <=> (p -> q) and (q -> p)", pass: iff(iff(p, q), and(then(p, q), then(q, p))) },
						{ name: "p <-> q <=> -p <-> -q", pass: iff(iff(p, q), iff(not(p), not(q))) },
						{ name: "p <-> q <=> (p and q) or (-p and -q)", pass: iff(iff(p, q), or(and(p, q), and(not(p), not(q)))) },
						{ name: "-(p <-> q) <=> p <-> -q <=> p xor q", pass: iff(not(iff(p, q)), iff(p, not(q)), xor(p, q)) }
					)
				})))
			}
		)
	})))
);
