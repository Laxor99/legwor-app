declare global {
	namespace App {
		interface Locals {
			authenticated: boolean;
		}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};
