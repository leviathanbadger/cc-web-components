use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn process_drag(delta: f64) -> f64 {
    delta
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_drag() {
        assert_eq!(process_drag(1.0), 1.0);
    }
}
